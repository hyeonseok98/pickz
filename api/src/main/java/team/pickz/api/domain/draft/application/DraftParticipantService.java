package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.response.ParticipantResponse;
import team.pickz.api.domain.draft.application.event.ParticipantJoinedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantUpdateEvent;
import team.pickz.api.domain.draft.application.util.RandomNicknameGenerator;
import team.pickz.api.domain.draft.application.util.RoomSequenceManager;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.draft.domain.type.RoomStatus;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DraftParticipantService {

    private final RoomSequenceManager roomSequenceManager;
    private final DraftRoomRepository draftRoomRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final DraftParticipantRepository draftParticipantRepository;

    @Transactional
    public ParticipantResponse joinRoom(String inviteCode) {
        DraftRoom room = draftRoomRepository.findByInviteCodeWithLock(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        if(room.getStatus() != RoomStatus.WAITING) {
            throw new IllegalStateException("드래프트가 진행 중이거나 종료되었습니다.");
        }

        int currentCount = draftParticipantRepository.countByRoomId(room.getId());
        if(currentCount >= room.getTeamCount()) {
            throw new IllegalStateException("방의 정원이 가득 찼습니다.");
        }

        int sequence = roomSequenceManager.getNextSequence(room.getId());
        String nickname = RandomNicknameGenerator.generate(sequence);

        DraftParticipant participant = DraftParticipant.builder()
                .roomId(room.getId())
                .nickname(nickname)
                .isHost(false)
                .build();
        draftParticipantRepository.save(participant);

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(room.getId());

        List<ParticipantResponse> participantResponses = participants.stream()
                .map(p -> new ParticipantResponse(
                        p.getId(),
                        p.getRoomId(),
                        p.getParticipantToken(), // 혹은 프론트가 필요한 필드들
                        p.getNickname(),
                        p.isHost(),
                        p.getSelectedCoachName(),
                        p.getTurnOrder(),
                        p.isReady()
                ))
                .toList();

        ParticipantUpdateEvent event = ParticipantUpdateEvent.builder()
                .roomId(room.getId())
                .participants(participantResponses)
                .build();

        applicationEventPublisher.publishEvent(
                ParticipantJoinedEvent.builder()
                        .roomId(room.getId())
                        .payload(event)
                        .build()
        );

        return ParticipantResponse.builder()
                .id(participant.getId())
                .roomId(room.getId())
                .participantToken(participant.getParticipantToken())
                .nickname(participant.getNickname())
                .isHost(participant.isHost())
                .isReady(participant.isReady())
                .build();
    }

    @Transactional
    public void selectCoach(Long roomId, String participantToken, String coachName, int targetTurnOrder) {
        DraftParticipant participant = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!participant.getRoomId().equals(roomId)) {
            throw new IllegalArgumentException("참여자가 해당 방에 속하지 않습니다.");
        }

        // 동시성 처리 고려: 이미 누군가 해당 감독/순서를 골랐는지 검증
        boolean isAlreadySelected = draftParticipantRepository.existsByRoomIdAndSelectedCoachName(roomId, coachName);
        if (isAlreadySelected) {
            throw new IllegalStateException("이미 다른 참가자가 선택한 감독입니다.");
        }

        participant.selectCoach(coachName, targetTurnOrder);
        draftParticipantRepository.flush();

        List<DraftParticipant> allParticipants = draftParticipantRepository.findAllByRoomIdOrderByTurnOrderAsc(roomId);

        List<ParticipantResponse> updatedParticipants = allParticipants.stream()
                .map(this::mapToParticipantResponse) // 위에서 만든 헬퍼 메서드 사용
                .toList();

        applicationEventPublisher.publishEvent(
                ParticipantUpdateEvent.builder()
                        .roomId(roomId)
                        .participants(updatedParticipants)
                        .build()
        );
    }

    private ParticipantResponse mapToParticipantResponse(DraftParticipant p) {
        return ParticipantResponse.builder()
                .id(p.getId())
                .roomId(p.getRoomId())
                .participantToken(null)
                .nickname(p.getNickname())
                .isHost(p.isHost())
                .selectedCoachName(p.getSelectedCoachName())
                .turnOrder(p.getTurnOrder())
                .isReady(p.getSelectedCoachName() != null)
                .build();
    }

}

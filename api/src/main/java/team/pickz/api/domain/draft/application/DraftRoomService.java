package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.request.RoomInitRequest;
import team.pickz.api.domain.draft.application.dto.response.*;
import team.pickz.api.domain.draft.application.event.DraftRoomStartedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantUpdateEvent;
import team.pickz.api.domain.draft.application.event.RoomDeletedEvent;
import team.pickz.api.domain.draft.application.event.RoomStatusEvent;
import team.pickz.api.domain.draft.domain.type.ParticipationType;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.member.domain.MemberRepository;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DraftRoomService {

    private final MemberRepository memberRepository;
    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public RoomInitResponse initRoom(/**Long hostMemberId,**/RoomInitRequest request) {
        //Member member = memberRepository.findByMemberId(hostMemberId);

        int teamCount = request.teamCount() != null ? request.teamCount() : 5;
        int teamSize = request.teamSize() != null ? request.teamSize() : 5;

        if ("2026_ZANATDAE".equals(request.preset())) {
            teamCount = 4;
            teamSize = 5;
        }

        DraftRoom room = DraftRoom.builder()
                .title(request.title())
                .draftMode(request.draftMode())
                .participationType(request.participationType())
                .preset(request.preset())
                .teamCount(teamCount)
                .teamSize(teamSize)
                .build();
        draftRoomRepository.save(room);

        DraftParticipant host = DraftParticipant.builder()
                .roomId(room.getId())
                //.memberId(member.getId())
                //.nickname(member.getNickname())
                .isHost(true)
                .build();
        draftParticipantRepository.save(host);

        return RoomInitResponse.builder()
                .roomId(room.getId())
                .inviteCode(room.getInviteCode())
                .participantToken(host.getParticipantToken())
                .isHost(true)
                .build();
    }

    @Transactional
    public void startDraft(Long roomId, String participantToken) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 드래프트를 시작할 수 있습니다.");
        }

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(roomId);

        // 혼자하기 모드가 아닐 경우, 참가자들이 모두 감독 선택을 완료했는지 검증
        if (room.getParticipationType() == ParticipationType.TOGETHER) {
            long selectedCount = participants.stream().filter(p -> p.getSelectedCoachName() != null).count();
            if (selectedCount != room.getTeamCount()) {
                throw new IllegalStateException("모든 참가자가 감독(팀)을 선택해야 시작할 수 있습니다.");
            }
        }

        room.start();

        // 기존의 Collections.shuffle(participants)는 삭제합니다.
        // -> 참가자가 직접 감독을 선택하면서 픽 순서(turnOrder)가 결정되었기 때문입니다.

        RoomStatusEvent event = RoomStatusEvent.builder()
                .code("SUCCESS")
                .roomStatus(room.getStatus())
                .redirectUrl("/drafts/" + roomId + "/play")
                .build();

        applicationEventPublisher.publishEvent(
                DraftRoomStartedEvent.builder()
                        .roomId(roomId)
                        .payload(event)
                        .build()
        );
    }

    @Transactional
    public void deleteRoom(Long roomId, String participantToken) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 방을 삭제할 수 있습니다.");
        }

        room.delete();
        draftRoomRepository.delete(room);

        applicationEventPublisher.publishEvent(
                RoomDeletedEvent.builder()
                        .roomId(roomId)
                        .message("방장이 방을 삭제했습니다.")
                        .build()
        );
    }

    @Transactional
    public void leaveRoom(Long roomId, String participantToken) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        DraftParticipant participant = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (participant.isHost()) {
            deleteRoom(roomId, participantToken);
            return;
        }

        draftParticipantRepository.delete(participant);

        List<DraftParticipant> remainingParticipants = draftParticipantRepository.findAllByRoomIdOrderByTurnOrderAsc(roomId);
        List<String> nicknames = remainingParticipants.stream()
                .map(DraftParticipant::getNickname)
                .toList();

        applicationEventPublisher.publishEvent(
                ParticipantUpdateEvent.builder()
                        .roomId(roomId)
                        .nicknames(nicknames)
                        .build()
        );
    }

}

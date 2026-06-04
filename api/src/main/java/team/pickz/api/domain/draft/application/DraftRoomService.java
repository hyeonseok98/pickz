package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.response.ParticipantResponse;
import team.pickz.api.domain.draft.application.event.DraftRoomStartedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantJoinedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantUpdateEvent;
import team.pickz.api.domain.draft.application.event.RoomStatusEvent;
import team.pickz.api.domain.draft.application.dto.request.RoomConfigureRequest;
import team.pickz.api.domain.draft.application.dto.response.RoomInitResponse;
import team.pickz.api.domain.draft.application.util.RandomNicknameGenerator;
import team.pickz.api.domain.draft.application.util.RoomSequenceManager;
import team.pickz.api.domain.draft.domain.RoomStatus;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.member.domain.Member;
import team.pickz.api.domain.member.domain.MemberRepository;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DraftRoomService {

    private final MemberRepository memberRepository;
    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final RoomSequenceManager roomSequenceManager;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public RoomInitResponse initRoom(/**Long hostMemberId,**/ String mode, String ruleName) {
        //Member member = memberRepository.findByMemberId(hostMemberId);

        DraftRoom room = DraftRoom.builder()
                .draftMode(mode)
                .draftRuleType(ruleName)
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
    public ParticipantResponse joinRoom(String inviteCode) {
        DraftRoom room = draftRoomRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        if (room.getStatus() != RoomStatus.WAITING) {
            throw new IllegalStateException("이미 게임이 시작된 방입니다.");
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
        List<String> nicknames = participants.stream()
                .map(DraftParticipant::getNickname)
                .toList();

        ParticipantUpdateEvent event = ParticipantUpdateEvent.builder()
                .totalCount(nicknames.size())
                .nicknames(nicknames)
                .newParticipant(nickname)
                .build();

        applicationEventPublisher.publishEvent(
                ParticipantJoinedEvent.builder()
                        .roomId(room.getId())
                        .payload(event)
                        .build()
        );

        return ParticipantResponse.builder()
                .roomId(room.getId())
                .participantToken(participant.getParticipantToken())
                .isHost(participant.isHost())
                .build();
    }

    @Transactional
    public void configureAndStartRoom(Long roomId, String participantToken, RoomConfigureRequest request) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 드래프트를 시작할 수 있습니다.");
        }

        if(!requestor.getRoomId().equals(roomId)) {
            throw new IllegalArgumentException("해당 방의 방장이 아닙니다.");
        }

        room.updateSettings(request.teamCount(), request.teamSize());

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(roomId);
        if (participants.size() != room.getTeamCount()) {
            throw new IllegalStateException("설정된 팀 개수만큼 참여자가 모여야 시작할 수 있습니다.");
        }

        room.start();

        Collections.shuffle(participants);
        for (int i = 0; i < participants.size(); i++) {
            participants.get(i).assignTurnOrder(i);
        }

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

}

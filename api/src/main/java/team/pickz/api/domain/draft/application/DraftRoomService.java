package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.response.ParticipantTokenResponse;
import team.pickz.api.domain.draft.application.dto.response.RoomCreateResponse;
import team.pickz.api.domain.draft.domain.RoomStatus;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class DraftRoomService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public RoomCreateResponse createRoom(Long hostMemberId, String mode, String rule, int teamCount, int teamSize) {
        DraftRoom room = DraftRoom.builder()
                .draftMode(mode).draftRuleType(rule)
                .teamCount(teamCount).teamSize(teamSize).build();
        draftRoomRepository.save(room);

        DraftParticipant host = DraftParticipant.builder()
                .roomId(room.getId())
                .memberId(hostMemberId)
                .nickname("방장")
                .isHost(true).build();
        draftParticipantRepository.save(host);

        return RoomCreateResponse.builder()
                .inviteCode(room.getInviteCode())
                .participantToken(host.getParticipantToken())
                .build();
    }

    @Transactional
    public ParticipantTokenResponse joinRoom(String inviteCode) {
        DraftRoom room = draftRoomRepository.findByInviteCode(inviteCode);

        long currentParticipants = draftParticipantRepository.countByRoomId(room.getId());
        if (currentParticipants >= room.getTeamCount()) {
            throw new IllegalStateException("방의 인원이 가득 찼습니다.");
        }

        if (room.getStatus() != RoomStatus.WAITING) {
            throw new IllegalStateException("이미 게임이 시작된 방입니다.");
        }

        String nickname = "PICKZ_" + UUID.randomUUID();
        DraftParticipant participant = DraftParticipant.builder()
                .roomId(room.getId())
                .nickname(nickname)
                .isHost(false).build();
        draftParticipantRepository.save(participant);

        messagingTemplate.convertAndSend("/topic/draft/room/" + room.getId() + "/lobby", "NEW_PARTICIPANT_JOINED");

        return ParticipantTokenResponse.builder()
                        .participantToken(participant.getParticipantToken())
                .build(); // 클라이언트는 이 토큰 저장해야 함
    }

    @Transactional
    public void startDraft(Long roomId, String participantToken) {
        DraftRoom room = draftRoomRepository.findById(roomId);
        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken);

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 드래프트를 시작할 수 있습니다.");
        }

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomIdOrderByTurnOrderAsc(roomId);
        if (participants.size() != room.getTeamCount()) {
            throw new IllegalStateException("설정된 팀 개수만큼 참여자가 모여야 시작할 수 있습니다.");
        }

        room.start();

        Collections.shuffle(participants);
        for (int i = 0; i < participants.size(); i++) {
            participants.get(i).assignTurnOrder(i);
        }

        messagingTemplate.convertAndSend("/topic/draft/room/" + roomId, "DRAFT_STARTED");
    }

}

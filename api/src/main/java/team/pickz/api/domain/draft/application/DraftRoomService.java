package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.domain.RoomStatus;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class DraftRoomService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository participantRepository;

    public String createRoom(Long hostId, int maxParticipants, String ruleName) {
        DraftRoom room = DraftRoom.create(hostId, maxParticipants, ruleName);
        draftRoomRepository.save(room);

        participantRepository.save(new DraftParticipant(room, hostId, 0));
        return room.getInviteCode();
    }

    public void joinRoom(String inviteCode, Long memberId) {
        DraftRoom room = draftRoomRepository.findByInviteCode(inviteCode);

        if (room.getStatus() != RoomStatus.WAITING) {
            throw new IllegalStateException("이미 게임이 시작된 방입니다.");
        }

        long currentCount = participantRepository.countByDraftRoom(room);
        if (currentCount >= room.getMaxParticipants()) {
            throw new IllegalStateException("방이 가득 찼습니다.");
        }

        participantRepository.save(new DraftParticipant(room, memberId, (int) currentCount));
    }

}

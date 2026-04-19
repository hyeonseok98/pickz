package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;

@Repository
@RequiredArgsConstructor
public class DraftRoomRepositoryImpl implements DraftRoomRepository {

    private final DraftRoomJpaRepository draftRoomJpaRepository;

    @Override
    public void save(DraftRoom draftRoom) {
        draftRoomJpaRepository.save(draftRoom);
    }

    @Override
    public DraftRoom findById(Long roomId) {
        return draftRoomJpaRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
    }

    @Override
    public DraftRoom findByInviteCode(String inviteCode) {
        return draftRoomJpaRepository.findByInviteCode(inviteCode);
    }

}

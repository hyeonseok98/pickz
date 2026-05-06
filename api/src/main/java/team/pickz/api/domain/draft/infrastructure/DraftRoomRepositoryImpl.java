package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DraftRoomRepositoryImpl implements DraftRoomRepository {

    private final DraftRoomJpaRepository draftRoomJpaRepository;

    @Override
    public void save(DraftRoom draftRoom) {
        draftRoomJpaRepository.save(draftRoom);
    }

    @Override
    public Optional<DraftRoom> findById(Long roomId) {
        return draftRoomJpaRepository.findById(roomId);
    }

    @Override
    public Optional<DraftRoom> findByInviteCode(String inviteCode) {
        return draftRoomJpaRepository.findByInviteCode(inviteCode);
    }

}

package team.pickz.api.domain.draft.domain.repository;

import org.springframework.data.repository.query.Param;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.Optional;

public interface DraftRoomRepository {

    DraftRoom save(DraftRoom draftRoom);

    Optional<DraftRoom> findById(Long roomId);

    Optional<DraftRoom> findByIdForUpdate(Long roomId);

    Optional<DraftRoom> findByInviteCode(String inviteCode);

    Optional<DraftRoom> findByInviteCodeWithLock(String inviteCode);

}

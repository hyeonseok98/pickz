package team.pickz.api.domain.draft.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.Optional;

public interface DraftRoomJpaRepository extends JpaRepository<DraftRoom, Long> {

    Optional<DraftRoom> findByInviteCode(String inviteCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM DraftRoom r WHERE r.id = :id")
    Optional<DraftRoom> findByIdForUpdate(@Param("id") Long id);

}

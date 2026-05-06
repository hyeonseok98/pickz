package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.Optional;

public interface DraftRoomJpaRepository extends JpaRepository<DraftRoom, Long> {

    Optional<DraftRoom> findByInviteCode(String inviteCode);

}

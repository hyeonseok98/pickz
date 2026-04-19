package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

public interface DraftRoomJpaRepository extends JpaRepository<DraftRoom, Long> {

    DraftRoom findByInviteCode(String inviteCode);

}

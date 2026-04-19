package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftPick;

public interface DraftPickJpaRepository extends JpaRepository<DraftPick, Long> {

    Boolean existsByDraftRoomIdAndStreamerId(Long roomId, String streamerId);

}

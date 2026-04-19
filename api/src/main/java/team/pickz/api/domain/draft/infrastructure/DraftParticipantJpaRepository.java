package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

public interface DraftParticipantJpaRepository extends JpaRepository<DraftParticipant, Long> {

    DraftParticipant findByDraftRoomAndTurnIndex(DraftRoom room, int turnIndex);

    Long countByDraftRoom(DraftRoom room);

}

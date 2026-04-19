package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

public interface DraftParticipantRepository {

    DraftParticipant save(DraftParticipant draftParticipant);

    Long countByDraftRoom(DraftRoom room);

    DraftParticipant findByDraftRoomAndTurnIndex(DraftRoom room, int turnIndex);

}

package team.pickz.api.domain.draft.domain.repository;

import org.springframework.data.repository.query.Param;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
import team.pickz.api.domain.draft.domain.type.Position;

import java.util.List;

public interface DraftPickRepository {

    void save(DraftPick draftPick);

    Boolean existsByRoomIdAndStreamerId(Long roomId, String streamerId);

    int countDistinctTeamIdByDraftRoomIdAndPosition(Long roomId, Position position);

    List<Long> findParticipantIdsByDraftRoomIdAndPosition(Long roomId, Position position);

}

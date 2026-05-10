package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftPick;

public interface DraftPickRepository {

    Boolean existsByRoomIdAndStreamerId(Long roomId, String streamerId);

    void save(DraftPick draftPick);

}

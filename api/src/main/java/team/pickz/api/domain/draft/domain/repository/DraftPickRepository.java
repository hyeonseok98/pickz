package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftPick;

public interface DraftPickRepository {

    void save(DraftPick draftPick);

    Boolean existsByRoomIdAndStreamerId(Long roomId, String streamerId);

}

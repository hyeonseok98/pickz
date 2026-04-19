package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftRoom;

public interface DraftRoomRepository {

    void save(DraftRoom draftRoom);

    DraftRoom findById(Long roomId);

    DraftRoom findByInviteCode(String inviteCode);

}

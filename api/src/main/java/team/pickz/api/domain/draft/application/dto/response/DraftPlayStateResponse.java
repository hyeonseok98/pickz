package team.pickz.api.domain.draft.application.dto.response;

import team.pickz.api.domain.draft.domain.type.RoomStatus;

public record DraftPlayStateResponse(

        Long roomId,

        RoomStatus roomStatus,

        DraftConfigResponse draftConfig

) {

}

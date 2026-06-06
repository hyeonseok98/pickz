package team.pickz.api.domain.draft.application.dto.request;

import team.pickz.api.domain.draft.application.dto.StreamerInfo;

public record DraftRoomStreamerRequest(

        int teamSlot,

        StreamerInfo top,

        StreamerInfo jug,

        StreamerInfo mid,

        StreamerInfo adc,

        StreamerInfo sup,

        StreamerInfo coach

) {
}

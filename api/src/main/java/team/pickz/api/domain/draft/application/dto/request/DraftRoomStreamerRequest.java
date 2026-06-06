package team.pickz.api.domain.draft.application.dto.request;

import java.util.List;

public record DraftRoomStreamerRequest(

        int teamSlot,

        String top,

        String jungle,

        String mid,

        String adc,

        String support,

        String coach

) {
}

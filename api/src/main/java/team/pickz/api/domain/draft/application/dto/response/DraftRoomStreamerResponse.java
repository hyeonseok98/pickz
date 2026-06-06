package team.pickz.api.domain.draft.application.dto.response;

import java.util.List;

public record DraftRoomStreamerResponse(

        List<String> top,

        List<String> jug,

        List<String> mid,

        List<String> adc,

        List<String> sup,

        List<String> coach

) {
}

package team.pickz.api.domain.draft.application.dto.response;

import java.util.List;

public record DraftConfigResponse(

        List<String> pickOrder,

        List<CoachResponse> coaches,

        StreamersByLine streamersByLine
) {

    public record StreamersByLine(
            List<String> top,
            List<String> jungle,
            List<String> mid,
            List<String> adc,
            List<String> support,
            List<String> coach
    ) {}

}

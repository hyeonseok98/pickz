package team.pickz.api.domain.draft.application.dto.response;

import team.pickz.api.domain.draft.application.dto.StreamerInfo;

import java.util.List;

public record DraftConfigResponse(

        List<String> pickOrder,

        List<CoachResponse> coaches,

        StreamersByLine streamersByLine
) {

    public record StreamersByLine(
            List<StreamerInfo> top,
            List<StreamerInfo> jug,
            List<StreamerInfo> mid,
            List<StreamerInfo> adc,
            List<StreamerInfo> sup,
            List<StreamerInfo> coach
    ) {}

}

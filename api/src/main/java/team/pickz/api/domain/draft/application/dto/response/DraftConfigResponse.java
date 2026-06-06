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
            List<StreamerInfo> jungle,
            List<StreamerInfo> mid,
            List<StreamerInfo> adc,
            List<StreamerInfo> support,
            List<StreamerInfo> coach
    ) {}

}

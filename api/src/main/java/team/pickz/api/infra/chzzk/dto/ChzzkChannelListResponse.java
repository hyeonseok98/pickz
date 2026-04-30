package team.pickz.api.infra.chzzk.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ChzzkChannelListResponse(

        int code,

        String message,

        Content content

) {

    public record Content(
            List<ChzzkChannelResponse> data
    ) {
    }

    public List<ChzzkChannelResponse> getData() {
        return content != null && content.data != null ? content.data : List.of();
    }

}

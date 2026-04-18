package team.pickz.api.infra.chzzk.dto;

import lombok.Builder;

@Builder
public record ChzzkChannelResponse(

        String channelId,

        String channelName,

        String channelImageUrl

) {
}

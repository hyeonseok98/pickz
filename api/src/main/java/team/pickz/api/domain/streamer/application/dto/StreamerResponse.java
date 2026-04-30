package team.pickz.api.domain.streamer.application.dto;

import team.pickz.api.domain.streamer.domain.Streamer;

public record StreamerResponse(

        Long id,

        String channelId,

        String channelName,

        String profileImageUrl

) {

    public static StreamerResponse from(Streamer streamer) {
        return new StreamerResponse(
                streamer.getId(),
                streamer.getChannelId(),
                streamer.getChannelName(),
                streamer.getProfileImageUrl()
        );
    }

}

package team.pickz.api.domain.streamer.application.dto;

import team.pickz.api.domain.streamer.domain.Streamer;

public record StreamerSearchResponse(

        Long id,

        String channelId,

        String channelName,

        String profileImageUrl

) {

    public static StreamerSearchResponse from(Streamer streamer) {
        return new StreamerSearchResponse(
                streamer.getId(),
                streamer.getChannelId(),
                streamer.getChannelName(),
                streamer.getProfileImageUrl()
        );
    }

}

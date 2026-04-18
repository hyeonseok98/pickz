package team.pickz.api.infra.chzzk.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import team.pickz.api.infra.chzzk.dto.ChzzkChannelResponseList;
import team.pickz.api.infra.chzzk.dto.ChzzkChannelResponse;

import java.util.List;

@Component
public class ChzzkClient {

    private final RestClient restClient;

    public ChzzkClient(@Qualifier("chzzkRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<ChzzkChannelResponse> getChannels(List<String> channelIds) {
        String channelIdsParam = String.join(",", channelIds);

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/open/v1/channels")
                        .queryParam("channelIds", channelIdsParam)
                        .build())
                .retrieve()
                .body(ChzzkChannelResponseList.class)
                .getData();
    }

}

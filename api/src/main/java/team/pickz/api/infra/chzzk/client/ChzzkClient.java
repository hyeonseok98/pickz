package team.pickz.api.infra.chzzk.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import team.pickz.api.infra.chzzk.dto.ChzzkChannelListResponse;
import team.pickz.api.infra.chzzk.dto.ChzzkChannelResponse;
import team.pickz.api.infra.chzzk.dto.ChzzkLiveListResponse;
import team.pickz.api.infra.chzzk.dto.ChzzkLiveResponse;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
public class ChzzkClient {

    private final RestClient restClient;

    public ChzzkClient(@Qualifier("chzzkRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<ChzzkChannelResponse> getChannels(List<String> channelIds) {
        String channelIdsParam = String.join(",", channelIds);

        ChzzkChannelListResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/open/v1/channels")
                        .queryParam("channelIds", channelIdsParam)
                        .build())
                .retrieve()
                .body(ChzzkChannelListResponse.class);

        return response != null ? response.getData() : List.of();
    }

    public List<ChzzkLiveResponse> getLives() {
        List<ChzzkLiveResponse> allLiveChannels = new ArrayList<>();
        Set<String> seenTokens = new HashSet<>();
        String nextToken = null;

        do {
            String finalNextToken = nextToken;

            try {
                ChzzkLiveListResponse response = restClient.get()
                        .uri(uriBuilder -> {
                            uriBuilder.path("/open/v1/lives")
                                    .queryParam("size", 20);
                            if(finalNextToken != null) {
                                uriBuilder.queryParam("next", finalNextToken);
                            }
                            return uriBuilder.build();
                        })
                        .retrieve()
                        .body(ChzzkLiveListResponse.class);

                if(response == null || response.code() != 200) {
                    log.warn("치지직 API 응답 오류: {}", response != null ? response.message() : "응답 없음");
                    break;
                }

                allLiveChannels.addAll(response.getData());

                nextToken = response.getPage();

                if(!StringUtils.hasText(nextToken)) {
                    nextToken = null;
                } else if(!seenTokens.add(nextToken)) {
                    log.warn("치지직 API 페이지 토큰이 반복되어 조회를 중단합니다. nextToken={}", nextToken);
                    break;
                }
                log.info("이미 본 토큰: seenTokens={}", seenTokens);

            } catch (HttpClientErrorException e) {
                log.warn("치지직 API 잘못된 요청 (next 토큰 오류 추정): {}", e.getResponseBodyAsString());
                break;
            } catch (Exception e) {
                log.error("치지직 라이브 목록 동기화 중 에러 발생", e);
                break;
            }

        } while (nextToken != null);

        return allLiveChannels;
    }

}

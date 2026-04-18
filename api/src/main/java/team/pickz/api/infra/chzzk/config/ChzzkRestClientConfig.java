package team.pickz.api.infra.chzzk.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration
@RequiredArgsConstructor
public class ChzzkRestClientConfig {

    private final ChzzkProperties chzzkProperties;

    @Bean(name = "chzzkRestClient")
    public RestClient chzzkRestClient() {
        return RestClient.builder()
                .baseUrl(chzzkProperties.baseUrl())
                .defaultHeader("Client-Id", chzzkProperties.clientId())
                .defaultHeader("Client-Secret", chzzkProperties.clientSecret())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

}

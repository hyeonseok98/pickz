package team.pickz.api.infra.chzzk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "chzzk.api")
public record ChzzkProperties(

        String baseUrl,

        String clientId,

        String clientSecret

) {
}

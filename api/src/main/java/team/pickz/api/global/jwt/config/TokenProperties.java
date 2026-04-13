package team.pickz.api.global.jwt.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "jwt")
public record TokenProperties (

        @NotBlank(message = "JWT secretKey는 비워둘 수 없습니다.")
        String secretKey,

        @NestedConfigurationProperty
        @NotNull
        ExpirationTime expirationTime

) {

        public record ExpirationTime (
                @Min(value = 1, message = "AccessToken 만료 시간은 최소 1초 이상이어야 합니다.")
                long accessToken,

                @Min(value = 1, message = "RefreshToken 만료 시간은 최소 1초 이상이어야 합니다.")
                long refreshToken
        ) {


        }

}



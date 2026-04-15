package team.pickz.api.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    private static final String HEADER_AUTH_NAME = "AccessToken_Header";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(initializeServers())
                .components(authComponents())
                .addSecurityItem(apiSecurityRequirement());
    }

    private Info apiInfo() {
        return new Info()
                .title("Pick:Z API")
                .description(
                        """
                        Pick:Z API 문서입니다.
                        
                        ### 소셜 로그인 안내
                        이 API는 OAuth 기반 소셜 로그인을 사용합니다.
                        - 별도의 API 엔드포인트 없음
                        - Spring Security 필터에서 처리
                        
                        #### 로그인 흐름
                        1. /api/oauth2/authorization/naver 호출
                        2. 소셜 로그인 진행
                        3. 서버에서 JWT 발급
                        
                        ### Swagger에서는 Header 방식으로 API 테스트 진행
                        
                        - 'Authorize' 버튼을 눌러 발급받은 JWT를 'Bearer {token}' 형식으로 입력하여 테스트할 수 있습니다.
                        """
                );
    }

    private List<Server> initializeServers() {
        return List.of(
                new Server().url("http://localhost:8080/api").description("Local Server"),
                new Server().url("https://pickz.co.kr/api").description("Prod Server")
        );
    }

    private Components authComponents() {
        return new Components()
                .addSecuritySchemes(HEADER_AUTH_NAME, new SecurityScheme()
                        .name("Authorization")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }

    private SecurityRequirement apiSecurityRequirement() {
        return new SecurityRequirement()
                .addList(HEADER_AUTH_NAME);
    }

}

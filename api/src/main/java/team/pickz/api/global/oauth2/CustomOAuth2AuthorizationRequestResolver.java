package team.pickz.api.global.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class CustomOAuth2AuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public CustomOAuth2AuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository) {
        // 스프링 시큐리티의 기본 리졸버를 감싸서(Proxy) 사용합니다.
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository,
                OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request);
        return customizeAuthorizationRequest(req);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request, clientRegistrationId);
        return customizeAuthorizationRequest(req);
    }

    private OAuth2AuthorizationRequest customizeAuthorizationRequest(OAuth2AuthorizationRequest req) {
        if (req == null) {
            return null;
        }

        // ⭐️ 오직 'chzzk' 로그인일 경우에만 파라미터 이름을 강제로 변경합니다.
        if ("chzzk".equals(req.getAttribute("registration_id"))) {
            String customUri = UriComponentsBuilder.fromUriString(req.getAuthorizationRequestUri())
                    .replaceQueryParam("client_id")      // 스프링이 넣은 표준 파라미터 제거
                    .replaceQueryParam("redirect_uri")
                    .queryParam("clientId", req.getClientId())       // 치지직 전용 카멜케이스 파라미터 추가
                    .queryParam("redirectUri", req.getRedirectUri())
                    .build(true).toUriString();

            return OAuth2AuthorizationRequest.from(req)
                    .authorizationRequestUri(customUri)
                    .build();
        }

        return req;
    }
}

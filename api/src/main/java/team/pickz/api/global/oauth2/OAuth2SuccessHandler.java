package team.pickz.api.global.oauth2;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import team.pickz.api.global.auth.application.AuthService;
import team.pickz.api.global.jwt.CookieUtil;
import team.pickz.api.global.jwt.JwtProvider;
import team.pickz.api.global.jwt.config.TokenProperties;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    private final TokenProperties tokenProperties;

    private final AuthService authService;

    @Value("${spring.security.oAuthUrl.redirect-url}")
    private String defaultRedirectUri;

    private final List<String> authorizedRedirectUris = List.of(
            "http://localhost:3000",
            "https://pickz.co.kr",
            "https://www.pickz.co.kr"
    );

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        String accessToken = jwtProvider.createAccessToken(oAuth2User.getMemberId(), oAuth2User.getRole().getAuthority());
        String refreshToken = jwtProvider.createRefreshToken(oAuth2User.getMemberId(), oAuth2User.getRole().getAuthority());
        authService.saveRefreshToken(oAuth2User.getMemberId(), refreshToken);


        int accessCookieMaxAge = (int) (tokenProperties.expirationTime().accessToken() / 1000);
        int refreshCookieMaxAge = (int) (tokenProperties.expirationTime().refreshToken() / 1000);

        CookieUtil.addCookie(response, "access_token", accessToken, accessCookieMaxAge);
        CookieUtil.addCookie(response, "refresh_token", refreshToken, refreshCookieMaxAge);

        String targetUrl = determineTargetUrl(request, response);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response) {
        String targetUrl = defaultRedirectUri;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("redirect_uri".equals(cookie.getName())) {
                    String redirectUriFromCookie = cookie.getValue();

                    if (isAuthorizedRedirectUri(redirectUriFromCookie)) {
                        targetUrl = redirectUriFromCookie;
                    }

                    cookie.setMaxAge(0);
                    cookie.setPath("/");
                    response.addCookie(cookie);
                    break;
                }
            }
        }
        return targetUrl;
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        try {
            URI candidate = URI.create(uri);
            int candidatePort = resolvePort(candidate);

            return authorizedRedirectUris.stream()
                    .map(URI::create)
                    .anyMatch(allowed ->
                            Objects.equals(allowed.getScheme(), candidate.getScheme())
                                    && Objects.equals(allowed.getHost(), candidate.getHost())
                                    && resolvePort(allowed) == candidatePort
                    );
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private int resolvePort(URI uri) {
        if (uri.getPort() != -1) {
            return uri.getPort();
        }
        return "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
    }

}



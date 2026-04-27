package team.pickz.api.global.oauth2;

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

@RequiredArgsConstructor
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    private final TokenProperties tokenProperties;

    private final AuthService authService;

    @Value("${spring.security.oAuthUrl.redirect-url}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        String accessToken = jwtProvider.createAccessToken(oAuth2User.getMemberId(), oAuth2User.getRole().getAuthority());
        String refreshToken = jwtProvider.createRefreshToken(oAuth2User.getMemberId(), oAuth2User.getRole().getAuthority());

        authService.saveRefreshToken(oAuth2User.getMemberId(), refreshToken);

        CookieUtil.addCookie(response, "access_token", accessToken, (int)tokenProperties.expirationTime().accessToken());
        CookieUtil.addCookie(response, "refresh_token", refreshToken, (int)tokenProperties.expirationTime().refreshToken());

        getRedirectStrategy().sendRedirect(request, response, redirectUri);
    }

}

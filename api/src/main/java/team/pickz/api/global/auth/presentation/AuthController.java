package team.pickz.api.global.auth.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team.pickz.api.global.auth.application.AuthService;
import team.pickz.api.global.auth.application.dto.TokenDto;
import team.pickz.api.global.jwt.CookieUtil;
import team.pickz.api.global.jwt.config.TokenProperties;

@RequiredArgsConstructor
@RequestMapping("/auths")
@RestController
public class AuthController {

    private final AuthService authService;

    private final TokenProperties tokenProperties;

    @PostMapping("/reissue")
    public ResponseEntity<Void> reissue(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = CookieUtil.getCookieValue(request, "refresh_token");

        if(refreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        TokenDto newTokens = authService.reissueToken(refreshToken);

        CookieUtil.addCookie(response, "access_token", newTokens.accessToken(), tokenProperties.expirationTime().accessToken());
        CookieUtil.addCookie(response, "refresh_token", newTokens.refreshToken(), tokenProperties.expirationTime().refreshToken());

        return ResponseEntity.ok().build();
    }

}

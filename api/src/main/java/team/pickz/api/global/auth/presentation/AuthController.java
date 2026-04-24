package team.pickz.api.global.auth.presentation;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team.pickz.api.global.annotation.MemberId;
import team.pickz.api.global.auth.application.AuthService;
import team.pickz.api.global.auth.application.dto.TokenResponse;

@RequiredArgsConstructor
@RequestMapping("/auths")
@RestController
public class AuthController implements AuthDocsController{

    private final AuthService authService;

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissueToken(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        TokenResponse newTokenResponse = authService.reissueToken(refreshToken, response);

        return ResponseEntity.ok(newTokenResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@MemberId Long memberId, HttpServletResponse response) {
        authService.logout(memberId, response);

        return ResponseEntity.ok().build();
    }

}

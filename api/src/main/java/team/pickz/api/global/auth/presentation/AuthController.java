package team.pickz.api.global.auth.presentation;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.global.annotation.MemberId;
import team.pickz.api.global.auth.application.AuthService;
import team.pickz.api.global.auth.application.dto.TokenResponse;
import team.pickz.api.global.jwt.CookieUtil;

@RequiredArgsConstructor
@RequestMapping("/auths")
@Controller
public class AuthController implements AuthDocsController{

    private final AuthService authService;

    @GetMapping("/login")
    public String login(
            @RequestParam(name = "redirect_uri", required = false) String redirectUri,
            HttpServletResponse response
    ) {
        if(redirectUri != null && !redirectUri.isBlank()) {
            CookieUtil.addCookie(response, "redirect_uri", redirectUri, 180);
        }
        else {
            CookieUtil.deleteCookie(response, "redirect_uri");
        }

        return "redirect:/oauth2/authorization/naver";
    }

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

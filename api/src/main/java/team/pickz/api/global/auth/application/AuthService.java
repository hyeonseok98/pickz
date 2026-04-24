package team.pickz.api.global.auth.application;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.global.auth.application.dto.TokenResponse;
import team.pickz.api.global.auth.domain.RefreshToken;
import team.pickz.api.global.auth.domain.RefreshTokenRepository;
import team.pickz.api.global.auth.presentation.exception.RefreshTokenNotValidException;
import team.pickz.api.global.jwt.CookieUtil;
import team.pickz.api.global.jwt.JwtProvider;
import team.pickz.api.global.jwt.config.TokenProperties;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final JwtProvider jwtProvider;
    private final TokenProperties tokenProperties;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void saveRefreshToken(Long memberId, String token) {
        refreshTokenRepository.save(RefreshToken.of(memberId, token));
    }

    @Transactional
    public TokenResponse reissueToken(String oldRefreshToken, HttpServletResponse response) {
        if(oldRefreshToken == null || !jwtProvider.validateToken(oldRefreshToken)) {
            throw new RefreshTokenNotValidException();
        }

        RefreshToken savedToken = refreshTokenRepository.findByToken(oldRefreshToken)
                .orElseThrow(() -> new RefreshTokenNotValidException());

        Long memberId = jwtProvider.getMemberId(oldRefreshToken);
        String role = jwtProvider.getRole(oldRefreshToken);

        String newAccessToken = jwtProvider.createAccessToken(memberId, role);
        String newRefreshToken = jwtProvider.createRefreshToken(memberId, role);

        savedToken.updateToken(newRefreshToken);

        CookieUtil.addCookie(response, "access_token", newAccessToken, (int)tokenProperties.expirationTime().accessToken() + 5);
        CookieUtil.addCookie(response, "refresh_token", newRefreshToken, (int)tokenProperties.expirationTime().refreshToken() + 5);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(Long memberId, HttpServletResponse response) {
        CookieUtil.deleteCookie(response, "access_token");
        CookieUtil.deleteCookie(response, "refresh_token");

        refreshTokenRepository.deleteByMemberId(memberId);
    }

}

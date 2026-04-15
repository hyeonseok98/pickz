package team.pickz.api.global.auth.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.global.auth.application.dto.TokenDto;
import team.pickz.api.global.auth.domain.RefreshToken;
import team.pickz.api.global.auth.domain.RefreshTokenRepository;
import team.pickz.api.global.jwt.JwtProvider;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void saveRefreshToken(Long memberId, String token) {
        refreshTokenRepository.save(RefreshToken.of(memberId, token));
    }

    @Transactional
    public TokenDto reissueToken(String oldRefreshToken) {
        if(!jwtProvider.validateToken(oldRefreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token 입니다.");
        }

        RefreshToken savedToken = refreshTokenRepository.findByToken(oldRefreshToken)
                .orElseThrow(() -> new IllegalArgumentException("만료되거나 존재하지 않는 세션입니다."));

        Long memberId = jwtProvider.getMemberId(oldRefreshToken);
        String role = jwtProvider.getRole(oldRefreshToken);

        String newAccessToken = jwtProvider.createAccessToken(memberId, role);
        String newRefreshToken = jwtProvider.createRefreshToken(memberId, role);

        savedToken.updateToken(newRefreshToken);

        return new TokenDto(newAccessToken, newRefreshToken);
    }

}

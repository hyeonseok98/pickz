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
        refreshTokenRepository.findById(memberId)
                .ifPresentOrElse(
                        rt -> rt.updateToken(token),
                        () -> refreshTokenRepository.save(RefreshToken.of(memberId, token))
                );
    }

    @Transactional
    public TokenDto reissueToken(String oldRefreshToken) {
        if(!jwtProvider.validateToken(oldRefreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 Refresh Token 입니다.");
        }

        Long memberId = jwtProvider.getMemberId(oldRefreshToken);
        String role = jwtProvider.getRole(oldRefreshToken);

        RefreshToken savedToken = refreshTokenRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("로그아웃된 사용자입니다."));

        if(!savedToken.getToken().equals(oldRefreshToken)) {
            refreshTokenRepository.deleteById(memberId);
            throw new SecurityException("비정상적인 토큰 접근이 감지되었습니다. 다시 로그인 해주세요.");
        }

        String newAccessToken = jwtProvider.createAccessToken(memberId, role);
        String newRefreshToken = jwtProvider.createRefreshToken(memberId, role);

        savedToken.updateToken(newRefreshToken);

        return new TokenDto(newAccessToken, newRefreshToken);
    }



}

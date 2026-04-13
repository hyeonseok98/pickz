package team.pickz.api.global.auth.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.global.auth.domain.RefreshToken;
import team.pickz.api.global.auth.domain.RefreshTokenRepository;

import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class RefreshTokenRepositoryImpl implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository refreshTokenJpaRepository;

    @Override
    public Optional<RefreshToken> findById(Long memberId) {
        return refreshTokenJpaRepository.findById(memberId);
    }

    @Override
    public RefreshToken save(RefreshToken refreshToken) {
        return refreshTokenJpaRepository.save(refreshToken);
    }

    @Override
    public void deleteById(Long memberId) {
        refreshTokenJpaRepository.deleteById(memberId);
    }

}

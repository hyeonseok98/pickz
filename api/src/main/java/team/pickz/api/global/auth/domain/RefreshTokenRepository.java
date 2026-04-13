package team.pickz.api.global.auth.domain;

import java.util.Optional;

public interface RefreshTokenRepository {

    Optional<RefreshToken> findById(Long memberId);

    RefreshToken save(RefreshToken refreshToken);

    void deleteById(Long memberId);

}

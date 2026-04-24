package team.pickz.api.global.auth.domain;

import java.util.Optional;

public interface RefreshTokenRepository {

    void save(RefreshToken refreshToken);

    Optional<RefreshToken> findByToken(String token);

    void deleteByMemberId(Long memberId);

}

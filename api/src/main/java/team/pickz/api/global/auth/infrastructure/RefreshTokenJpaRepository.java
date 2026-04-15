package team.pickz.api.global.auth.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.global.auth.domain.RefreshToken;

import java.util.Optional;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteAllByMemberId(Long memberId);

}

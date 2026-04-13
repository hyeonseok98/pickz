package team.pickz.api.global.auth.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.global.auth.domain.RefreshToken;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Long> {
}

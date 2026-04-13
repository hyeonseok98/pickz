package team.pickz.api.domain.member.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.member.domain.LoginProvider;
import team.pickz.api.domain.member.domain.Member;

import java.util.Optional;

public interface MemberJpaRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByProviderAndExternalId(LoginProvider provider, String externalId);

}

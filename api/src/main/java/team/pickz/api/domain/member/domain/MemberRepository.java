package team.pickz.api.domain.member.domain;

import java.util.Optional;

public interface MemberRepository {

    Member save(Member member);

    Optional<Member> findByProviderAndExternalId(LoginProvider provider, String externalId);

    Member findByMemberId(Long memberId);

}

package team.pickz.api.domain.member.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.member.domain.LoginProvider;
import team.pickz.api.domain.member.domain.Member;
import team.pickz.api.domain.member.domain.MemberRepository;

import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class MemberRepositoryImpl implements MemberRepository {

    private final MemberJpaRepository memberJpaRepository;

    @Override
    public Member save(Member member) {
        return memberJpaRepository.save(member);
    }

    @Override
    public Optional<Member> findByProviderAndExternalId(LoginProvider provider, String externalId) {
        return memberJpaRepository.findByProviderAndExternalId(provider, externalId);
    }

    @Override
    public Member findByMemberId(Long memberId) {
        return memberJpaRepository.findById(memberId).orElse(null);
    }

}

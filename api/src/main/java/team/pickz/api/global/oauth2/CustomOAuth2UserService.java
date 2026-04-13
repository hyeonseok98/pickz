package team.pickz.api.global.oauth2;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.member.domain.Member;
import team.pickz.api.domain.member.domain.MemberRepository;
import team.pickz.api.global.oauth2.attributes.NaverAuthAttributes;
import team.pickz.api.global.oauth2.attributes.AuthAttributes;

import java.util.Map;

@RequiredArgsConstructor
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthAttributes authAttributes = extractAuthAttributes(registrationId, oAuth2User.getAttributes());

        Member member = getOrSaveMember(authAttributes);

        return new CustomOAuth2User(member.getId(), member.getRole(), oAuth2User.getAttributes());
    }

    private AuthAttributes extractAuthAttributes(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return NaverAuthAttributes.of(attributes);
        }

        throw new IllegalArgumentException("지원하지 않는 소셜 로그인입니다: " + registrationId);
    }

    private Member getOrSaveMember(AuthAttributes attributes) {
        return memberRepository.findByProviderAndExternalId(attributes.getProvider(), attributes.getExternalId())
                .orElseGet(() -> {
                    String safeEmail = (attributes.getEmail() != null) ? attributes.getEmail() : "no-email@" + attributes.getExternalId() + ".com";
                    String safeNickname = (attributes.getNickname() != null) ? attributes.getNickname() : "PickZ유저_" + attributes.getExternalId().substring(0, 5);

                    Member newMember = Member.createSocialMember(
                            safeEmail,
                            safeNickname,
                            attributes.getProvider(),
                            attributes.getExternalId()
                    );
                    return memberRepository.save(newMember);
                });
    }

}

package team.pickz.api.global.oauth2.attribute;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import team.pickz.api.domain.member.domain.LoginProvider;

import java.util.Map;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class NaverAuthAttributes implements AuthAttributes {

    private final String externalId;
    private final String email;
    private final String nickname;

    public static NaverAuthAttributes of(Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");

        if (response == null || response.get("id") == null) {
            throw new IllegalArgumentException("네이버 로그인 응답에 필수 정보가 누락되었습니다.");
        }

        return new NaverAuthAttributes(
                (String) response.get("id"),
                (String) response.get("email"),
                (String) response.get("nickname")
        );
    }

    @Override
    public String getExternalId() {
        return externalId;
    }

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getNickname() {
        return nickname;
    }

    @Override
    public LoginProvider getProvider() {
        return LoginProvider.NAVER;
    }

}

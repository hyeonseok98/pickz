package team.pickz.api.global.oauth2.attributes;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import team.pickz.api.domain.member.domain.LoginProvider;

import java.util.Map;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ChzzkAuthAttributes implements AuthAttributes {

    private final String externalId;
    private final String email;
    private final String nickname;

    public static ChzzkAuthAttributes of(Map<String, Object> attributes) {

        Map<String, Object> content = (Map<String, Object>) attributes.get("content");

        if (content == null || content.get("channelId") == null) {
            throw new IllegalArgumentException("치지직 로그인 응답에 필수 정보가 누락되었습니다.");
        }

        return new ChzzkAuthAttributes(
                (String) content.get("channelId"),
                null,
                (String) content.get("channelName")
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
        return LoginProvider.CHZZK;
    }
}

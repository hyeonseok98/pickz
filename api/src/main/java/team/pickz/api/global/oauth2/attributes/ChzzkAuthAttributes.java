package team.pickz.api.global.oauth2.attributes;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import team.pickz.api.domain.member.domain.LoginProvider;

import java.util.Map;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ChzzkAuthAttributes implements AuthAttributes {

    private final String externalId;
    private final String nickname;

    public static ChzzkAuthAttributes of(Map<String, Object> attributes) {

        Map<String, Object> content = (Map<String, Object>) attributes.get("content");

        return new ChzzkAuthAttributes(
                (String) content.get("channelId"),
                (String) content.get("channelName")
        );
    }

    @Override
    public String getExternalId() {
        return externalId;
    }

    @Override
    public String getEmail() {
        return "";
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

package team.pickz.api.global.oauth2.attribute;

import team.pickz.api.domain.member.domain.LoginProvider;

public interface AuthAttributes {

    String getExternalId();

    String getEmail();

    String getNickname();

    LoginProvider getProvider();

}

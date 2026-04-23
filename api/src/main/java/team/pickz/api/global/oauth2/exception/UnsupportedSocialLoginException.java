package team.pickz.api.global.oauth2.exception;

import team.pickz.api.global.exception.CustomException;

public class UnsupportedSocialLoginException extends CustomException {

    public UnsupportedSocialLoginException() {
      super(OAuth2ExceptionCode.UNSUPPORTED_SOCIAL_LOGIN);
    }

}

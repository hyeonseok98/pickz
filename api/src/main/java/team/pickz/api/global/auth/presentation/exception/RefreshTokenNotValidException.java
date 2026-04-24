package team.pickz.api.global.auth.presentation.exception;

import team.pickz.api.global.exception.CustomException;

public class RefreshTokenNotValidException extends CustomException {

    public RefreshTokenNotValidException() {
        super(AuthExceptionCode.REFRESH_TOKEN_NOT_VALID);
    }

}

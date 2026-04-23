package team.pickz.api.global.auth.presentation.exception;

import team.pickz.api.global.exception.CustomException;

public class UnsupportedProviderException extends CustomException {

    public UnsupportedProviderException() {
        super(AuthExceptionCode.INVALID_AUTH_CODE);
    }

}

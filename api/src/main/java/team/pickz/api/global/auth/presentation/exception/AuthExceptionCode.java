package team.pickz.api.global.auth.presentation.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import team.pickz.api.global.exception.ExceptionCode;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Getter
@RequiredArgsConstructor
public enum AuthExceptionCode implements ExceptionCode {
    ALREADY_REGISTERED_MEMBER(BAD_REQUEST, "다른 계정으로 이미 가입된 사용자입니다."),
    AUTHENTICATION_REQUIRED(UNAUTHORIZED, "인증 정보가 유효하지 않습니다."),
    REFRESH_TOKEN_NOT_VALID(UNAUTHORIZED, "리프레시 토큰이 유효하지 않습니다."),
    UNSUPPORTED_PROVIDER(BAD_REQUEST, "지원하지 않는 로그인 제공자입니다."),
    INVALID_STATE_COOKIE(BAD_REQUEST, "state 파라미터가 유효하지 않습니다."),
    INVALID_AUTH_CODE(UNAUTHORIZED, "인증 코드가 유효하지 않거나 만료되었습니다."),
    ;

    private final HttpStatus status;

    private final String message;

    @Override
    public String getCode() {
        return this.name();
    }

}

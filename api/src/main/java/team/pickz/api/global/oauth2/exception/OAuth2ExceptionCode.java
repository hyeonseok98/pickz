package team.pickz.api.global.oauth2.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import team.pickz.api.global.exception.ExceptionCode;

@Getter
@RequiredArgsConstructor
public enum OAuth2ExceptionCode implements ExceptionCode {
    UNSUPPORTED_SOCIAL_LOGIN(HttpStatus.BAD_REQUEST, "지원하지 않는 소셜 로그인입니다."),
    ;

    private final HttpStatus status;

    private final String message;

    @Override
    public String getCode() {
        return this.name();
    }

}

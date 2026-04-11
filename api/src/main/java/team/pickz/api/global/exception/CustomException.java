package team.pickz.api.global.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

    private final ExceptionCode code;

    public CustomException(ExceptionCode code) {
        super(code.getMessage());
        this.code = code;
    }

    public CustomException(ExceptionCode code, Throwable cause) {
        super(code.getMessage(),cause);
        this.code = code;
    }

    public boolean isServerError() {
        return code.getStatus().is5xxServerError();
    }

}

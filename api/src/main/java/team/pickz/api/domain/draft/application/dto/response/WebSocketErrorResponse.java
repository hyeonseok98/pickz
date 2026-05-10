package team.pickz.api.domain.draft.application.dto.response;

public record WebSocketErrorResponse(
        String type,    // ERROR 고정 (클라이언트에서 타입 검사용)
        String code,    // INVALID_TURN, ALREADY_PICKED 등
        String message  // "자신의 턴이 아닙니다.", "이미 선택된 스트리머입니다." 등
) {

    public static WebSocketErrorResponse of(String code, String message) {
        return new WebSocketErrorResponse("ERROR", code, message);
    }

}

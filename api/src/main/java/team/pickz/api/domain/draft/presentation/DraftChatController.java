package team.pickz.api.domain.draft.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import team.pickz.api.domain.draft.application.DraftChatService;
import team.pickz.api.domain.draft.application.dto.request.ChatMessageRequest;
import team.pickz.api.domain.draft.application.dto.response.WebSocketErrorResponse;

@Slf4j
@RequiredArgsConstructor
@Controller
public class DraftChatController {

    private final DraftChatService draftChatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/drafts/rooms/{roomId}/chat")
    public void chat(
            @DestinationVariable Long roomId,
            @Valid @Payload ChatMessageRequest message
    ) {
        draftChatService.processChat(roomId, message);
    }

    // 기존 컨트롤러와 동일한 에러 처리 패턴 적용 (추후 @ControllerAdvice 계층으로 공통화할 것)
    @MessageExceptionHandler({IllegalArgumentException.class})
    public void handleChatException(RuntimeException e, SimpMessageHeaderAccessor headerAccessor) {
        log.warn("Invalid chat request: {}", e.getMessage());

        WebSocketErrorResponse errorResponse = WebSocketErrorResponse.of("CHAT_FAILED", e.getMessage());

        String sessionId = headerAccessor.getSessionId();
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        accessor.setSessionId(sessionId);
        accessor.setLeaveMutable(true);

        messagingTemplate.convertAndSendToUser(
                sessionId,
                "/queue/errors",
                errorResponse,
                accessor.getMessageHeaders()
        );
    }

}

package team.pickz.api.domain.draft.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import team.pickz.api.domain.draft.application.DraftPlayService;
import team.pickz.api.domain.draft.application.dto.request.PickMessageRequest;
import team.pickz.api.domain.draft.application.dto.response.WebSocketErrorResponse;

@Slf4j
@RequiredArgsConstructor
@Controller
public class DraftMessageController implements DraftMessageDocsController {

    private final DraftPlayService draftPlayService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/drafts/rooms/{roomId}")
    public void pickStreamer(
            @DestinationVariable Long roomId,
            @Valid @Payload PickMessageRequest message
    ) {
        draftPlayService.processPick(roomId, message);
    }

    @MessageExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public void handlePickException(RuntimeException e, SimpMessageHeaderAccessor headerAccessor) {
        log.warn("Invalid pick request: {}", e.getMessage());

        WebSocketErrorResponse errorResponse = WebSocketErrorResponse.of("PICK_FAILED", e.getMessage());

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

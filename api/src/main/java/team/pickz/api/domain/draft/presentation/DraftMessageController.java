package team.pickz.api.domain.draft.presentation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import team.pickz.api.domain.draft.application.DraftPlayService;
import team.pickz.api.domain.draft.application.dto.request.PickMessageRequest;

@Slf4j
@RequiredArgsConstructor
@Controller
public class DraftMessageController {

    private final DraftPlayService draftPlayService;

    @MessageMapping("/draft/rooms/{roomId}/pick")
    public void pickStreamer(
            @DestinationVariable Long roomId,
            @Payload PickMessageRequest message
    ) {
        log.info("Pick request. RoomId: {}, MemberId: {}, StreamerId: {}",
                roomId, message.participantToken(), message.streamerId());

        try {
            draftPlayService.processPick(roomId, message.participantToken(), message.streamerId());
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Invalid pick request: {}", e.getMessage());
            // 필요한 경우 요청한 사용자에게만 에러를 전송하는 로직 추가
            // messagingTemplate.convertAndSendToUser(...)
        } catch (Exception e) {
            log.error("Error processing pick", e);
        }
    }

}

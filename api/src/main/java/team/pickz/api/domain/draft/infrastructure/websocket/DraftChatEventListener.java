package team.pickz.api.domain.draft.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import team.pickz.api.domain.draft.application.event.DraftChatEvent;

@Slf4j
@RequiredArgsConstructor
@Component
public class DraftChatEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleChatEvent(DraftChatEvent event) {
        String destination = String.format("/topic/drafts/rooms/%d/chat", event.roomId());

        messagingTemplate.convertAndSend(destination, event.chatMessage());
    }

}

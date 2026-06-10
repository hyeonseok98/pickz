package team.pickz.api.domain.draft.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import team.pickz.api.domain.draft.application.event.*;

@RequiredArgsConstructor
@Component
public class DraftEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPickCompleted(DraftPickedEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/drafts/rooms/" + event.roomId(), event.result());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleParticipantJoined(ParticipantJoinedEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/drafts/rooms/" + event.roomId(), event.payload());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoomStarted(DraftRoomStartedEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/drafts/rooms/" + event.roomId(), event.payload());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleParticipantUpdated(ParticipantUpdateEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/drafts/rooms/" + event.roomId() + "/participants", event
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoomDeletedEvent(RoomDeletedEvent event) {
        // 프론트엔드는 이 구독 채널에서 메시지를 받으면 socket.disconnect()를 호출하고 홈으로 튕겨냅니다.
        messagingTemplate.convertAndSend(
                "/topic/drafts/rooms/" + event.roomId() + "/deleted",
                event
        );
    }

}

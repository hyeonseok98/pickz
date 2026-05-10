package team.pickz.api.domain.draft.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import team.pickz.api.domain.draft.application.event.DraftPickedEvent;
import team.pickz.api.domain.draft.application.event.DraftRoomStartedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantJoinedEvent;

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

}

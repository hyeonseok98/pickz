package team.pickz.api.domain.draft.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import team.pickz.api.domain.draft.application.DraftRoomService;

@Slf4j
@RequiredArgsConstructor
@Component
public class DraftConnectionEventListener {

    private final DraftSessionManager sessionManager;
    private final DraftRoomService draftRoomService;

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String participantToken = accessor.getFirstNativeHeader("X-Participant-Token");
        String roomIdStr = accessor.getFirstNativeHeader("roomId");
        String sessionId = accessor.getSessionId();

        if (participantToken != null && roomIdStr != null) {
            try {
                Long roomId = Long.parseLong(roomIdStr);
                sessionManager.addSession(sessionId, roomId, participantToken);
            } catch (NumberFormatException e) {
                log.warn("잘못된 roomId 형식: {}", roomIdStr);
            }
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        DraftSessionManager.SessionInfo info = sessionManager.removeSession(sessionId);

        if (info != null) {
            log.info("WebSocket 연결 해제 - SessionId: {}, RoomId: {}", sessionId, info.roomId());
            try {
                draftRoomService.leaveRoom(info.roomId(), info.participantToken());
            } catch (Exception e) {
                log.warn("퇴장 처리 중 무시 가능한 예외 발생: {}", e.getMessage());
            }
        }
    }
}

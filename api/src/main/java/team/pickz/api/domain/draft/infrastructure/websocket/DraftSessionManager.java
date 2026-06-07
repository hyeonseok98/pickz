package team.pickz.api.domain.draft.infrastructure.websocket;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DraftSessionManager {

    private final Map<String, SessionInfo> sessionMap = new ConcurrentHashMap<>();

    public record SessionInfo(Long roomId, String participantToken) {}

    public void addSession(String sessionId, Long roomId, String participantToken) {
        sessionMap.put(sessionId, new SessionInfo(roomId, participantToken));
    }

    public SessionInfo removeSession(String sessionId) {
        return sessionMap.remove(sessionId);
    }
}

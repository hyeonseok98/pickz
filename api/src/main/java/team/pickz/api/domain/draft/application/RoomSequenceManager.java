package team.pickz.api.domain.draft.application;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RoomSequenceManager {

    private final Map<Long, AtomicInteger> roomSequences = new ConcurrentHashMap<>();

    public int getNextSequence(Long roomId) {
        return roomSequences
                .computeIfAbsent(roomId, k -> new AtomicInteger(0))
                .incrementAndGet();
    }

    public void removeRoomSequence(Long roomId) {
        roomSequences.remove(roomId);
    }

}

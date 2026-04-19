package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class DraftTimerService {

    private final TaskScheduler taskScheduler;
    private final DraftPickService draftPickService;

    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    private static final int TURN_TIME_SECONDS = 30;

    public void scheduleAutoPick(Long roomId, Long expectedMemberId) {
        cancelTimer(roomId);

        Runnable autoPickTask = () -> {
            log.info("[Auto-Pick] 방 {} 의 유저 {} 가 시간 초과로 자동 픽을 진행합니다.", roomId, expectedMemberId);
            // TODO: 실제로는 남은 스트리머 중 랜덤이나 가장 인기있는 사람을 골라주는 로직 필요
            String randomStreamerId = "AUTO_PICKED_STREAMER_ID";
            draftPickService.processPick(roomId, expectedMemberId, randomStreamerId);
        };

        ScheduledFuture<?> future = taskScheduler.schedule(autoPickTask, Instant.now().plusSeconds(TURN_TIME_SECONDS));

        scheduledTasks.put(roomId, future);
    }

    public void cancelTimer(Long roomId) {
        ScheduledFuture<?> future = scheduledTasks.remove(roomId);
        if (future != null && !future.isDone()) {
            future.cancel(false);
        }
    }

}

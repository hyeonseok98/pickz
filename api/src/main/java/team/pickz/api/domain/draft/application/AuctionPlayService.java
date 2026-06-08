package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.response.AuctionPhaseResponse;
import team.pickz.api.domain.draft.application.dto.response.AuctionSyncResponse;
import team.pickz.api.domain.draft.application.dto.response.AuctionResultResponse;
import team.pickz.api.domain.draft.domain.type.AuctionPhase;
import team.pickz.api.domain.draft.domain.type.Position;
import team.pickz.api.domain.draft.infrastructure.websocket.AuctionRoomState;
import team.pickz.api.domain.draft.domain.repository.DraftPickRepository;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.infrastructure.websocket.AuctionSessionManager;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionPlayService {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionSessionManager sessionManager;
    private final DraftPickRepository draftPickRepository;
    private final DraftParticipantRepository draftParticipantRepository;

    // ✅ 해결: 타이머 관리를 위한 스케줄러와 맵 선언 (필수)
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    private final Map<Long, ScheduledFuture<?>> roomTaskMap = new ConcurrentHashMap<>();

    /**
     * 입찰 요청 처리
     */
    public void handleBid(Long roomId, Long teamId, int amount) {
        AuctionRoomState state = sessionManager.getRoomState(roomId);

        if (state.placeBid(teamId, amount)) {
            // 입찰 성공 시 15초 제한시간 초기화
            resetBiddingTimer(roomId, state);

            String teamName = state.getTeamStates().get(teamId).getTeamName();
            String streamerName = state.getMainQueue().peek().getStreamerName();
            String chatMessage = String.format("%s - %s - %d포인트", teamName, streamerName, amount);

            messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/chat", chatMessage);

            // UI 업데이트를 위한 입찰 상황 동기화
            broadcastRoomState(roomId, state);
        }
    }

    /**
     * 경매 라운드 종료 및 평가 (EVALUATING 단계)
     */
    @Transactional
    public void evaluateRoundEnd(Long roomId) {
        AuctionRoomState state = sessionManager.getRoomState(roomId);
        state.setCurrentPhase(AuctionPhase.EVALUATING);

        // ✅ 해결: getStreamerQueue() -> getMainQueue() 로 변경
        AuctionRoomState.StreamerAuctionItem currentStreamer = state.getMainQueue().poll();
        if (currentStreamer == null) return;

        List<AuctionResultResponse.AutoAssignResult> autoAssignResults = new ArrayList<>();

        if (state.getCurrentHighestBidTeamId() != null) {
            // [낙찰 성공]
            Long winningTeamId = state.getCurrentHighestBidTeamId();
            int winningBid = state.getCurrentHighestBidAmount();

            AuctionRoomState.TeamState winningTeam = state.getTeamStates().get(winningTeamId);
            winningTeam.deductPoints(winningBid);
            winningTeam.addStreamer(currentStreamer);

            // TODO: DB 영속화 로직 (DraftPick 저장 등)

            // (5) 포지션 독점 체크 및 자동 배정
            checkAndProcessPositionMonopoly(roomId, state, currentStreamer.getPosition(), autoAssignResults);

        } else {
            // [유찰 발생]
            if (!state.isReAuctionPhase()) {
                // 1차 경매 중 유찰 시: 유찰 목록으로 업데이트
                state.getUnbidQueue().offer(currentStreamer);
            } else {
                // 재경매 중에도 유찰 시: 남은 팀의 맞는 라인에 자동 배정
                Long targetTeamId = findTeamNeedingPosition(state, currentStreamer.getPosition());
                if (targetTeamId != null) {
                    AuctionRoomState.TeamState targetTeam = state.getTeamStates().get(targetTeamId);
                    targetTeam.addStreamer(currentStreamer); // 0포인트로 로스터 합류

                    messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/chat",
                            String.format("[시스템] %s 선수가 %s에 자동 배정되었습니다.", currentStreamer.getStreamerName(), targetTeam.getTeamName()));
                }
            }
        }

        // 라운드 종료 후 상태 정리 및 다음 라운드 준비
        state.resetBidInfo();
        prepareNextRound(roomId, state);
    }

    private void prepareNextRound(Long roomId, AuctionRoomState state) {
        // ✅ 해결: 메인 큐가 비어있는지 확인
        if (state.getMainQueue().isEmpty()) {
            if (!state.getUnbidQueue().isEmpty() && !state.isReAuctionPhase()) {
                state.startReAuctionPhase();
                messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/chat", "[시스템] 모든 경매가 종료되어 유찰자 재경매를 시작합니다.");
            } else {
                messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/finish", "경매가 모두 종료되었습니다.");
                return;
            }
        }

        broadcastRoomState(roomId, state);
        scheduleNextRound(roomId);
    }

    private Long findTeamNeedingPosition(AuctionRoomState state, Position position) {
        for (Map.Entry<Long, AuctionRoomState.TeamState> entry : state.getTeamStates().entrySet()) {
            boolean hasPosition = entry.getValue().getRoster().stream()
                    .anyMatch(s -> s.getPosition().equals(position));
            if (!hasPosition) {
                return entry.getKey();
            }
        }
        return null;
    }

    public void broadcastRoomState(Long roomId, AuctionRoomState state) {
        AuctionSyncResponse response = AuctionSyncResponse.from(state);
        messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/sync", response);
    }

    /**
     * (1) 다음 경매 라운드 스케줄링
     */
    public void scheduleNextRound(Long roomId) {
        AuctionRoomState state = sessionManager.getRoomState(roomId);

        // ✅ 해결: 메인 큐가 비었으면 스케줄링 종료
        if (state.getMainQueue().isEmpty()) return;

        state.setCurrentPhase(AuctionPhase.STANDBY);
        broadcastPhase(roomId, AuctionPhase.STANDBY, 10);

        ScheduledFuture<?> standbyFuture = scheduler.schedule(() -> {
            state.setCurrentPhase(AuctionPhase.COUNTDOWN);
            broadcastPhase(roomId, AuctionPhase.COUNTDOWN, 3);

            ScheduledFuture<?> countdownFuture = scheduler.schedule(() -> {
                state.setCurrentPhase(AuctionPhase.BIDDING);
                broadcastPhase(roomId, AuctionPhase.BIDDING, 15);

                scheduleEvaluation(roomId, state);
            }, 3, TimeUnit.SECONDS);

            roomTaskMap.put(roomId, countdownFuture);
        }, 10, TimeUnit.SECONDS);

        roomTaskMap.put(roomId, standbyFuture);
    }

    private void resetBiddingTimer(Long roomId, AuctionRoomState state) {
        ScheduledFuture<?> currentTask = roomTaskMap.get(roomId);
        if (currentTask != null && !currentTask.isDone()) {
            currentTask.cancel(false);
        }

        broadcastPhase(roomId, AuctionPhase.BIDDING, 15);
        scheduleEvaluation(roomId, state);
    }

    private void scheduleEvaluation(Long roomId, AuctionRoomState state) {
        ScheduledFuture<?> evalFuture = scheduler.schedule(() -> {
            evaluateRoundEnd(roomId);
        }, 15, TimeUnit.SECONDS);
        roomTaskMap.put(roomId, evalFuture);
    }

    private void broadcastPhase(Long roomId, AuctionPhase phase, int remainSeconds) {
        AuctionPhaseResponse payload = new AuctionPhaseResponse(phase, remainSeconds);

        messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/phase", payload);
    }

    private int getTeamCountHavingPosition(Long roomId, Position position) {
        return draftPickRepository.countDistinctTeamIdByDraftRoomIdAndPosition(roomId, position);
    }

    private Long getTeamWithoutPosition(Long roomId, Position position) {
        // findTeamIdsByDraftRoomId -> ParticipantRepository의 메서드명에 맞게 조정해주세요.
        List<Long> allTeamIds = draftParticipantRepository.findParticipantIdsByDraftRoomId(roomId);
        List<Long> teamIdsWithPosition = draftPickRepository.findTeamIdsByDraftRoomIdAndPosition(roomId, position);

        return allTeamIds.stream()
                .filter(teamId -> !teamIdsWithPosition.contains(teamId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("해당 포지션이 비어있는 팀을 찾을 수 없습니다."));
    }

    /**
     * (7) 재경매 초과 시 랜덤 배정
     */
    private Long getRandomAvailableTeam(AuctionRoomState state) {
        // ✅ 해결: getTeamPoints() 대신 getTeamStates() 사용
        List<Long> allTeams = new ArrayList<>(state.getTeamStates().keySet());
        Collections.shuffle(allTeams);
        return allTeams.get(0);
    }

    /**
     * (5) 남은 포지션 1개 남았을 때 0포인트 자동 배정 로직
     */
    private void checkAndProcessPositionMonopoly(Long roomId, AuctionRoomState state, Position position, List<AuctionResultResponse.AutoAssignResult> autoAssignResults) {
        int teamsHavingPosition = getTeamCountHavingPosition(roomId, position);

        if (teamsHavingPosition == 3) {
            // ✅ 해결: getStreamerQueue() 대신 getMainQueue() 참조
            List<AuctionRoomState.StreamerAuctionItem> remainingStreamers = state.getMainQueue().stream()
                    .filter(s -> s.getPosition().equals(position))
                    .collect(Collectors.toList());

            if (remainingStreamers.size() == 1) {
                AuctionRoomState.StreamerAuctionItem lastStreamer = remainingStreamers.get(0);
                Long remainingTeamId = getTeamWithoutPosition(roomId, position);

                // ✅ 큐에서 제거하고 TeamState에 직접 추가 (0포인트)
                state.getMainQueue().remove(lastStreamer);
                AuctionRoomState.TeamState targetTeam = state.getTeamStates().get(remainingTeamId);
                targetTeam.addStreamer(lastStreamer);

                autoAssignResults.add(AuctionResultResponse.AutoAssignResult.builder()
                        .streamerId(lastStreamer.getStreamerId())
                        .teamId(remainingTeamId)
                        .bidPoint(0)
                        .reason(String.format("해당 포지션(%s)의 마지막 선수이므로 자동 배정", position))
                        .build());

                messagingTemplate.convertAndSend("/topic/draft/room/" + roomId + "/chat",
                        String.format("[시스템] %s 선수가 포지션 독점 방지를 위해 %s에 자동 배정되었습니다.", lastStreamer.getStreamerName(), targetTeam.getTeamName()));
            }
        }
    }
}
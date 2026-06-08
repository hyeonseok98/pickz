package team.pickz.api.domain.draft.application;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.response.AuctionPhaseResponse;
import team.pickz.api.domain.draft.application.dto.response.AuctionSyncResponse;
import team.pickz.api.domain.draft.application.dto.response.AuctionResultResponse;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
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
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    private final Map<Long, ScheduledFuture<?>> roomTaskMap = new ConcurrentHashMap<>();

    @PreDestroy
    public void destroy() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    public void handleBid(Long roomId, String participantToken, int amount) {
        AuctionRoomState state = sessionManager.getRoomState(roomId);

        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참가자입니다."));

        if (state.placeBid(requestor.getId(), amount)) {
            resetBiddingTimer(roomId, state);

            String teamName = state.getTeamStates().get(requestor.getId()).getTeamName();
            AuctionRoomState.StreamerAuctionItem currentStreamer = state.getMainQueue().peek();
            if (currentStreamer == null) return;
            String streamerName = currentStreamer.getStreamerName();
            String chatMessage = String.format("%s - %s - %d포인트", teamName, streamerName, amount);

            messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/chat", chatMessage);

            broadcastRoomState(roomId, state);
        }
    }

    @Transactional
    public void evaluateRoundEnd(Long roomId) {
        AuctionRoomState state = sessionManager.getRoomState(roomId);
        state.setCurrentPhase(AuctionPhase.EVALUATING);

        AuctionRoomState.StreamerAuctionItem currentStreamer = state.getMainQueue().poll();
        if (currentStreamer == null) return;

        List<AuctionResultResponse.AutoAssignResult> autoAssignResults = new ArrayList<>();

        if (state.getCurrentHighestBidParticipantId() != null) {
            Long winningTeamId = state.getCurrentHighestBidParticipantId();
            int winningBid = state.getCurrentHighestBidAmount();

            AuctionRoomState.TeamState winningTeam = state.getTeamStates().get(winningTeamId);
            winningTeam.deductPoints(winningBid);
            winningTeam.addStreamer(currentStreamer);

            DraftPick pick = DraftPick.builder()
                    .roomId(roomId)
                    .participantId(winningTeamId)
                    .streamerId(String.valueOf(currentStreamer.getStreamerId()))
                    .streamerName(currentStreamer.getStreamerName())
                    .position(currentStreamer.getPosition())
                    .roundIndex(winningTeam.getRoster().size())
                    .build();
            draftPickRepository.save(pick);

            checkAndProcessPositionMonopoly(roomId, state, currentStreamer.getPosition(), autoAssignResults);

        } else {
            if (!state.isReAuctionPhase()) {
                state.getUnbidQueue().offer(currentStreamer);
            } else {
                Long targetTeamId = findTeamNeedingPosition(state, currentStreamer.getPosition());
                if (targetTeamId != null) {
                    AuctionRoomState.TeamState targetTeam = state.getTeamStates().get(targetTeamId);
                    targetTeam.addStreamer(currentStreamer);

                    DraftPick autoPick = DraftPick.builder()
                            .roomId(roomId)
                            .participantId(targetTeamId)
                            .streamerId(String.valueOf(currentStreamer.getStreamerId()))
                            .streamerName(currentStreamer.getStreamerName())
                            .position(currentStreamer.getPosition())
                            .roundIndex(targetTeam.getRoster().size())
                            .build();
                    draftPickRepository.save(autoPick);

                    messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/chat",
                            String.format("[시스템] %s 선수가 %s에 자동 배정되었습니다.", currentStreamer.getStreamerName(), targetTeam.getTeamName()));
                }
            }
        }

        state.resetBidInfo();
        prepareNextRound(roomId, state);
    }

    private void prepareNextRound(Long roomId, AuctionRoomState state) {
        if (state.getMainQueue().isEmpty()) {
            if (!state.getUnbidQueue().isEmpty() && !state.isReAuctionPhase()) {
                state.startReAuctionPhase();
                messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/chat", "[시스템] 모든 경매가 종료되어 유찰자 재경매를 시작합니다.");
            } else {
                messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/finish", "경매가 모두 종료되었습니다.");
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
        messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/sync", response);
    }

    public void scheduleNextRound(Long roomId) {
        AuctionRoomState state = sessionManager.getRoomState(roomId);

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

        messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/phase", payload);
    }

    private int getTeamCountHavingPosition(Long roomId, Position position) {
        return draftPickRepository.countDistinctTeamIdByDraftRoomIdAndPosition(roomId, position);
    }

    private Long getTeamWithoutPosition(Long roomId, Position position) {
        List<Long> allTeamIds = draftParticipantRepository.findParticipantIdsByDraftRoomId(roomId);
        List<Long> teamIdsWithPosition = draftPickRepository.findTeamIdsByDraftRoomIdAndPosition(roomId, position);

        return allTeamIds.stream()
                .filter(teamId -> !teamIdsWithPosition.contains(teamId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("해당 포지션이 비어있는 팀을 찾을 수 없습니다."));
    }

    private Long getRandomAvailableTeam(AuctionRoomState state) {
        List<Long> allTeams = new ArrayList<>(state.getTeamStates().keySet());
        Collections.shuffle(allTeams);
        return allTeams.get(0);
    }

    private void checkAndProcessPositionMonopoly(Long roomId, AuctionRoomState state, Position position, List<AuctionResultResponse.AutoAssignResult> autoAssignResults) {
        int teamsHavingPosition = getTeamCountHavingPosition(roomId, position);

        if (teamsHavingPosition == 3) {
            List<AuctionRoomState.StreamerAuctionItem> remainingStreamers = state.getMainQueue().stream()
                    .filter(s -> s.getPosition().equals(position))
                    .collect(Collectors.toList());

            if (remainingStreamers.size() == 1) {
                AuctionRoomState.StreamerAuctionItem lastStreamer = remainingStreamers.get(0);
                Long remainingTeamId = getTeamWithoutPosition(roomId, position);

                state.getMainQueue().remove(lastStreamer);
                AuctionRoomState.TeamState targetTeam = state.getTeamStates().get(remainingTeamId);
                targetTeam.addStreamer(lastStreamer);

                autoAssignResults.add(AuctionResultResponse.AutoAssignResult.builder()
                        .streamerId(lastStreamer.getStreamerId())
                        .teamId(remainingTeamId)
                        .bidPoint(0)
                        .reason(String.format("해당 포지션(%s)의 마지막 선수이므로 자동 배정", position))
                        .build());

                messagingTemplate.convertAndSend("/topic/drafts/rooms/" + roomId + "/chat",
                        String.format("[시스템] %s 선수가 포지션 독점 방지를 위해 %s에 자동 배정되었습니다.", lastStreamer.getStreamerName(), targetTeam.getTeamName()));
            }
        }
    }

}
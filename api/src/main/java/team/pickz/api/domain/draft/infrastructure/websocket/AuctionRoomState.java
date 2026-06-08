package team.pickz.api.domain.draft.infrastructure.websocket;

import lombok.Getter;
import team.pickz.api.domain.draft.domain.type.AuctionPhase;
import team.pickz.api.domain.draft.domain.type.Position;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Getter
public class AuctionRoomState {
    private final Long roomId;
    private AuctionPhase currentPhase;

    private boolean isReAuctionPhase = false;

    private final Queue<StreamerAuctionItem> mainQueue;
    private final Queue<StreamerAuctionItem> unbidQueue = new ConcurrentLinkedDeque<>();

    private final Map<Long, TeamState> teamStates = new ConcurrentHashMap<>();

    private Long currentHighestBidParticipantId;
    private int currentHighestBidAmount = 0;

    public AuctionRoomState(Long roomId, List<TeamInfo> teams, List<StreamerAuctionItem> streamers) {
        this.roomId = roomId;
        this.currentPhase = AuctionPhase.STANDBY;

        Collections.shuffle(streamers);
        this.mainQueue = new ConcurrentLinkedDeque<>(streamers);

        teams.forEach(t -> teamStates.put(t.getTeamId(), new TeamState(t.getTeamName())));
    }

    // 입찰 시도 (동시성 제어를 위해 synchronized 처리, 실제 환경에선 Redisson 분산락 권장)
    public synchronized boolean placeBid(Long participantId, int amount) {
        if (this.currentPhase != AuctionPhase.BIDDING) return false;
        if (amount % 5 != 0) return false; // 5단위 검증
        if (amount <= currentHighestBidAmount) return false; // 이전보다 낮거나 같으면 불가

        int availablePoints = teamStates.get(participantId).getRemainingPoints();
        if (amount > availablePoints) return false; // 포인트 부족

        this.currentHighestBidParticipantId = participantId;
        this.currentHighestBidAmount = amount;
        return true;
    }

    public void resetBidInfo() {
        this.currentHighestBidParticipantId = null;
        this.currentHighestBidAmount = 0;
    }

    public void startReAuctionPhase() {
        this.isReAuctionPhase = true;
        this.mainQueue.addAll(this.unbidQueue); // 유찰 큐의 인원들을 메인 큐로 이동
        this.unbidQueue.clear();
    }

    @Getter
    public static class TeamState {
        private final String teamName;
        private int remainingPoints = 1000;
        private final List<StreamerAuctionItem> roster = new ArrayList<>(); // 라인별 스트리머 정보

        public TeamState(String teamName) { this.teamName = teamName; }
        public void deductPoints(int points) { this.remainingPoints -= points; }
        public void addStreamer(StreamerAuctionItem streamer) { this.roster.add(streamer); }
    }

    public void setCurrentPhase(AuctionPhase currentPhase) {
        this.currentPhase = currentPhase;
    }

    @Getter
    public static class StreamerAuctionItem {
        private final Long streamerId;
        private final String streamerName;
        private final String profileImageUrl;
        private final Position position;

        public StreamerAuctionItem(Long id, String name, String image, Position position) {
            this.streamerId = id;
            this.streamerName = name;
            this.profileImageUrl = image;
            this.position = position;
        }
    }

    @Getter
    public static class TeamInfo {
        private final Long teamId;
        private final String teamName;
        public TeamInfo(Long id, String name) { this.teamId = id; this.teamName = name; }
    }

}

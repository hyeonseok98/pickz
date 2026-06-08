package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;
import lombok.Getter;
import team.pickz.api.domain.draft.infrastructure.websocket.AuctionRoomState;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Builder
public class AuctionSyncResponse {
    private String currentPhase;
    private boolean isReAuctionPhase;

    // 현재 경매 중인 스트리머 상세 정보
    private AuctionRoomState.StreamerAuctionItem currentStreamer;

    // (1) 앞으로 남은 경매 순서 목록
    private List<AuctionRoomState.StreamerAuctionItem> upcomingStreamers;

    // (3) 현재까지 유찰된 스트리머 목록 (이미지, 이름 포함)
    private List<AuctionRoomState.StreamerAuctionItem> unbidStreamers;

    // (1) 각 팀의 실시간 로스터 및 남은 포인트 현황
    private Map<Long, AuctionRoomState.TeamState> teamStates;

    // 현재 입찰 현황
    private Long currentHighestBidTeamId;
    private int currentHighestBidAmount;

    public static AuctionSyncResponse from(AuctionRoomState state) {
        return AuctionSyncResponse.builder()
                .currentPhase(state.getCurrentPhase().name())
                .isReAuctionPhase(state.isReAuctionPhase())
                .currentStreamer(state.getMainQueue().peek())
                .upcomingStreamers(state.getMainQueue().stream().skip(1).collect(Collectors.toList()))
                .unbidStreamers(List.copyOf(state.getUnbidQueue()))
                .teamStates(state.getTeamStates())
                .currentHighestBidTeamId(state.getCurrentHighestBidParticipantId())
                .currentHighestBidAmount(state.getCurrentHighestBidAmount())
                .build();
    }
}
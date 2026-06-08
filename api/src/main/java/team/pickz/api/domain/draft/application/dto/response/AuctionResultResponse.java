package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AuctionResultResponse {
    private String roundStatus; // "SOLD" or "UNBID"
    private BidResult primaryResult;
    private List<AutoAssignResult> autoAssignedResults; // (5), (7) 자동 배정 결과
    private List<TeamPoint> teamPoints; // (6) 각 팀 남은 포인트
    private Long nextStreamerId; // 유찰의 경우 맨 뒤로 가고 다음 선수 진행

    @Getter
    @Builder
    public static class BidResult {
        private Long streamerId;
        private Long teamId;
        private int winningBid;
    }

    @Getter
    @Builder
    public static class AutoAssignResult {
        private Long streamerId;
        private Long teamId;
        private int bidPoint; // 항상 0
        private String reason; // 자동 배정 사유
    }

    @Getter
    @Builder
    public static class TeamPoint {
        private Long teamId;
        private int remainingPoints;
    }
}

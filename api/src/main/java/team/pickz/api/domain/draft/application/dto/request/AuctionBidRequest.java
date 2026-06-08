package team.pickz.api.domain.draft.application.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AuctionBidRequest {
    private String participantToken;
    private int amount; // 입찰 포인트 (5의 배수)
}
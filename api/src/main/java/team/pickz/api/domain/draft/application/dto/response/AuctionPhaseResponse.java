package team.pickz.api.domain.draft.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import team.pickz.api.domain.draft.domain.type.AuctionPhase;

@Getter
@AllArgsConstructor
public class AuctionPhaseResponse {
    private AuctionPhase phase;
    private int remainSeconds;
}

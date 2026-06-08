package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AuctionBidRequest {

    @NotBlank
    private String participantToken;

    @Positive
    private int amount;

}
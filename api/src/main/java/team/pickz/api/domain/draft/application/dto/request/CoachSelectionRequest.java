package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CoachSelectionRequest(

        @NotBlank(message = "감독 이름은 필수입니다.")
        String coachName,

        @NotNull(message = "픽 순서는 필수입니다.")
        Integer targetTurnOrder

) {
}

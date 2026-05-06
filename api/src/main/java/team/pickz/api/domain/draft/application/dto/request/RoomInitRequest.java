package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record RoomInitRequest(

        @NotBlank(message = "참여 모드는 필수 입니다.")
        String mode,

        @NotBlank(message = "드래프트 룰 이름은 필수입니다.")
        String ruleName

) {
}

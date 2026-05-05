package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record RoomCreateRequest(

        @Min(value = 1, message = "참가자 수는 최소 1명 이상이어야 합니다.")
        int maxParticipants,

        String mode,

        @NotBlank(message = "드래프트 룰 이름은 필수입니다.")
        String ruleName, // 예: "SNAKE"

        int teamCount,

        int teamSize

) {
}

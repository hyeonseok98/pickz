package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.Min;

public record RoomConfigureRequest(

        @Min(value = 1, message = "팀 수는 1 이상이어야 합니다.")
        int teamCount,

        @Min(value = 1, message = "팀 인원은 1 이상이어야 합니다.")
        int teamSize

) {
}

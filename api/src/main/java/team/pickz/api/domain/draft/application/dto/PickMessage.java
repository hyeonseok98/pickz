package team.pickz.api.domain.draft.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record PickMessage(

        @NotNull(message = "참여자 토큰은 필수입니다.")
        String participantToken,

        @NotBlank(message = "스트리머 ID는 필수입니다.")
        String streamerId

) {

}

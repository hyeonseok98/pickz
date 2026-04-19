package team.pickz.api.domain.draft.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PickMessage(

        @NotNull(message = "회원 ID는 필수입니다.")
        Long memberId,

        @NotBlank(message = "스트리머 ID는 필수입니다.")
        String streamerId

) {

}

package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatMessageRequest(

        @NotBlank(message = "참여자 토큰은 필수입니다.")
        String participantToken,

        @NotBlank(message = "채팅 메시지는 비어있을 수 없습니다.")
        @Size(max = 200, message = "채팅은 최대 200자까지 가능합니다.")
        String content

) {
}

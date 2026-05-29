package team.pickz.api.domain.draft.application.event;

import lombok.Builder;
import team.pickz.api.domain.draft.application.dto.response.ChatMessageResponse;

@Builder
public record DraftChatEvent(

        Long roomId,

        ChatMessageResponse chatMessage

) {
}

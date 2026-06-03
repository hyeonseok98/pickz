package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import team.pickz.api.domain.draft.domain.MessageType;

@Builder
public record ChatMessageResponse(

        String nickname,

        String content,

        MessageType type,

        LocalDateTime timestamp

) {

    public static ChatMessageResponse of(String nickname, String content, MessageType type) {
        return ChatMessageResponse.builder()
                .nickname(nickname)
                .content(content)
                .type(type)
                .timestamp(LocalDateTime.now())
                .build();
    }

}

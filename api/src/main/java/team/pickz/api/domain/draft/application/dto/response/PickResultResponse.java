package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record PickResultResponse(

        String code,

        Long roomId,

        String pickedNickname,

        String pickedStreamerId,

        String pickedStreamerName,

        String pickedStreamerImageUrl,

        String nextTurnNickname,

        boolean isDraftDone

) {
}

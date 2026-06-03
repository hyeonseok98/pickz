package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record PickResultResponse(

        Long roomId,

        String pickedNickname,

        String pickedStreamerId,

        String nextTurnNickname,

        boolean isDraftDone

) {
}

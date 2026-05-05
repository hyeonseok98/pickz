package team.pickz.api.domain.draft.application.dto;

import lombok.Builder;

@Builder
public record PickResult(

        Long roomId,

        String pickedNickname,

        String pickedStreamerId,

        String nextTurnNickname,

        boolean isDraftDone

) {
}

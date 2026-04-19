package team.pickz.api.domain.draft.application.dto;

public record PickResult(
        Long roomId,
        Long pickedMemberId,
        String pickedStreamerId,

        boolean isDraftDone,
        Integer nextTurnIndex,
        int currentRound
) {
}

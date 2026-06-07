package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record ParticipantResponse(

        Long id,

        Long roomId,

        String participantToken,

        String nickname,

        boolean isHost,

        String selectedCoachName,

        Integer turnOrder,

        boolean isReady

) {
}

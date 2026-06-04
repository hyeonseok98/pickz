package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record ParticipantResponse(

        Long roomId,

        String participantToken,

        Boolean isHost

) {
}

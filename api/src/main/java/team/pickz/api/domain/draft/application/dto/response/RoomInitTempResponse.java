package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record RoomInitTempResponse(

        Long roomId,

        String inviteCode,

        String participantToken

) {
}

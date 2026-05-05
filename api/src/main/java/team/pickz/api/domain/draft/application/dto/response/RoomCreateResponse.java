package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record RoomCreateResponse(

        String inviteCode,

        String participantToken

) {
}

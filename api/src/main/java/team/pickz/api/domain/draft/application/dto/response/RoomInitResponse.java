package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

@Builder
public record RoomInitResponse(

        Long roomId,

        String inviteCode,

        String participantToken,

        boolean isHost

) {
}

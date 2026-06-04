package team.pickz.api.domain.draft.application.event;

import lombok.Builder;

@Builder
public record DraftRoomStartedEvent(

        String code,

        Long roomId,

        RoomStatusEvent payload

) {
}

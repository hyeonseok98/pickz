package team.pickz.api.domain.draft.application.event;

import lombok.Builder;

@Builder
public record DraftRoomStartedEvent(

        Long roomId,

        RoomStatusEvent payload

) {
}

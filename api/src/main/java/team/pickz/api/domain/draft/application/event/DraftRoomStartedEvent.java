package team.pickz.api.domain.draft.application.event;

import lombok.Builder;

@Builder
public record DraftRoomStartedEvent(

        RoomStatusEvent payload,

        Long roomId

) {
}

package team.pickz.api.domain.draft.application.event;

import lombok.Builder;
import team.pickz.api.domain.draft.domain.RoomStatus;

@Builder
public record RoomStatusEvent(

        String code,

        RoomStatus roomStatus,

        String redirectUrl

) {
}

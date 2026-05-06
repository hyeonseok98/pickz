package team.pickz.api.domain.draft.application.dto;

import lombok.Builder;
import team.pickz.api.domain.draft.domain.RoomStatus;

@Builder
public record RoomStatusEvent(

        RoomStatus roomStatus,

        String redirectUrl

) {
}

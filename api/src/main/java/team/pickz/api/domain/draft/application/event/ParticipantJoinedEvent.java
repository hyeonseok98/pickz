package team.pickz.api.domain.draft.application.event;

import lombok.Builder;

@Builder
public record ParticipantJoinedEvent(

        Long roomId,

        ParticipantUpdateEvent payload

) {
}

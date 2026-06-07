package team.pickz.api.domain.draft.application.event;

import lombok.Builder;
import team.pickz.api.domain.draft.application.dto.response.ParticipantResponse;

import java.util.List;

@Builder
public record ParticipantUpdateEvent(

        Long roomId,

        List<ParticipantResponse> participants

) {
}

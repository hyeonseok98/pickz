package team.pickz.api.domain.draft.application.event;

import lombok.Builder;
import team.pickz.api.domain.draft.application.dto.response.PickResultResponse;

@Builder
public record DraftPickedEvent(

        PickResultResponse result,

        Long roomId

) {
}

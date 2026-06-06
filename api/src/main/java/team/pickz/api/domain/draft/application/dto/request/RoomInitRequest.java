package team.pickz.api.domain.draft.application.dto.request;

import jakarta.validation.constraints.NotNull;
import team.pickz.api.domain.draft.domain.type.DraftMode;
import team.pickz.api.domain.draft.domain.type.ParticipationType;

public record RoomInitRequest(

        String title,

        @NotNull(message = "드래프트 방식은 필수입니다.")
        DraftMode draftMode,

        @NotNull(message = "참여 방식은 필수입니다.")
        ParticipationType participationType,

        String preset,

        Integer teamCount,

        Integer teamSize

) {
}

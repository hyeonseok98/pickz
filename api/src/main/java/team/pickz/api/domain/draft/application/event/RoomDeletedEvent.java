package team.pickz.api.domain.draft.application.event;

import lombok.Builder;

@Builder
public record RoomDeletedEvent(
        Long roomId,
        String message
) {}
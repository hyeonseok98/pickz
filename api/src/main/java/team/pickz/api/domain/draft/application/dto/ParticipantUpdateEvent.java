package team.pickz.api.domain.draft.application.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ParticipantUpdateEvent(

        int totalCount,

        List<String> nicknames,

        String newParticipant

) {
}

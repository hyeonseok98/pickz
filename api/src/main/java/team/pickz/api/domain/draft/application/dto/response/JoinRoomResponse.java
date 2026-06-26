package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;
import team.pickz.api.domain.draft.domain.type.DraftMode;
import team.pickz.api.domain.draft.domain.type.ParticipationType;

import java.util.List;

@Builder
public record JoinRoomResponse(

        Long roomId,

        String title,

        DraftMode draftMode,

        ParticipationType participationType,

        int teamCount,

        String participantToken,

        String nickname,

        boolean isHost,

        List<ParticipantResponse> participants,

        List<String> availableCoaches

) {
}

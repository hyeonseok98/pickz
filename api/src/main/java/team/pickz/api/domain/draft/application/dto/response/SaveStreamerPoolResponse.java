package team.pickz.api.domain.draft.application.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record SaveStreamerPoolResponse(

        List<String> availableCoaches

) {
}

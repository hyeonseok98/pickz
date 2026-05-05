package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.List;

public interface DraftParticipantRepository {

    DraftParticipant save(DraftParticipant draftParticipant);

    Long countByRoomId(Long roomId);

    DraftParticipant findByParticipantToken(String participantToken);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

}

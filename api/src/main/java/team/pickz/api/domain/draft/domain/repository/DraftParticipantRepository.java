package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftParticipant;

import java.util.List;
import java.util.Optional;

public interface DraftParticipantRepository {

    DraftParticipant save(DraftParticipant draftParticipant);

    Optional<DraftParticipant> findByParticipantToken(String participantToken);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

    List<DraftParticipant> findAllByRoomId(Long roomId);

    Optional<DraftParticipant> findByRoomIdAndParticipantToken(Long roomId, String participantToken);

}

package team.pickz.api.domain.draft.domain.repository;

import org.springframework.data.repository.query.Param;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;

import java.util.List;
import java.util.Optional;

public interface DraftParticipantRepository {

    void flush();

    int countByRoomId(Long roomId);

    void delete(DraftParticipant participant);

    List<DraftParticipant> findAllByRoomId(Long roomId);

    DraftParticipant save(DraftParticipant draftParticipant);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

    boolean existsByRoomIdAndSelectedCoachName(Long roomId, String coachName);

    Optional<DraftParticipant> findByParticipantToken(String participantToken);

    Optional<DraftParticipant> findByRoomIdAndParticipantToken(Long roomId, String participantToken);

    List<Long> findParticipantIdsByDraftRoomId(Long roomId);

}

package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;

import java.util.List;
import java.util.Optional;

public interface DraftParticipantJpaRepository extends JpaRepository<DraftParticipant, Long> {

    List<DraftParticipant> findAllByRoomId(Long roomId);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

    boolean existsByRoomIdAndSelectedCoachName(Long roomId, String coachName);

    Optional<DraftParticipant> findByParticipantToken(String participantToken);

    Optional<DraftParticipant> findByRoomIdAndParticipantToken(Long roomId, String participantToken);

}

package team.pickz.api.domain.draft.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.List;
import java.util.Optional;

public interface DraftParticipantJpaRepository extends JpaRepository<DraftParticipant, Long> {

    int countByRoomId(Long roomId);

    List<DraftParticipant> findAllByRoomId(Long roomId);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

    boolean existsByRoomIdAndSelectedCoachName(Long roomId, String coachName);

    Optional<DraftParticipant> findByParticipantToken(String participantToken);

    Optional<DraftParticipant> findByRoomIdAndParticipantToken(Long roomId, String participantToken);

    @Query("SELECT dp.id FROM DraftParticipant dp WHERE dp.roomId = :roomId")
    List<Long> findParticipantIdsByDraftRoomId(@Param("roomId") Long roomId);
}


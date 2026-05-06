package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.List;
import java.util.Optional;

public interface DraftParticipantJpaRepository extends JpaRepository<DraftParticipant, Long> {

    Long countByRoomId(Long roomId);

    List<DraftParticipant> findAllByRoomId(Long roomId);

    Optional<DraftParticipant> findByParticipantToken(String participantToken);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

}

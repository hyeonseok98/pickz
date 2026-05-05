package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;

import java.util.List;

public interface DraftParticipantJpaRepository extends JpaRepository<DraftParticipant, Long> {

    Long countByRoomId(Long roomId);

    DraftParticipant findByParticipantToken(String participantToken);

    List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId);

}

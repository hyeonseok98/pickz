package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;

@Repository
@RequiredArgsConstructor
public class DraftParticipantRepositoryImpl implements DraftParticipantRepository {

    private final DraftParticipantJpaRepository draftParticipantJpaRepository;

    @Override
    public DraftParticipant save(DraftParticipant draftParticipant) {
        return draftParticipantJpaRepository.save(draftParticipant);
    }

    @Override
    public Long countByDraftRoom(DraftRoom room) {
        return draftParticipantJpaRepository.countByDraftRoom(room);
    }

    @Override
    public DraftParticipant findByDraftRoomAndTurnIndex(DraftRoom room, int turnIndex) {
        return draftParticipantJpaRepository.findByDraftRoomAndTurnIndex(room, turnIndex);
    }

}

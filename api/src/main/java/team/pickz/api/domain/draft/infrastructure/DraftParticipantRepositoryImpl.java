package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class DraftParticipantRepositoryImpl implements DraftParticipantRepository {

    private final DraftParticipantJpaRepository draftParticipantJpaRepository;

    @Override
    public DraftParticipant save(DraftParticipant draftParticipant) {
        return draftParticipantJpaRepository.save(draftParticipant);
    }

    @Override
    public Long countByRoomId(Long roomId) {
        return draftParticipantJpaRepository.countByRoomId(roomId);
    }

    @Override
    public DraftParticipant findByParticipantToken(String participantToken) {
        return draftParticipantJpaRepository.findByParticipantToken(participantToken);
    }

    @Override
    public List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId) {
        return draftParticipantJpaRepository.findAllByRoomIdOrderByTurnOrderAsc(roomId);
    }

}

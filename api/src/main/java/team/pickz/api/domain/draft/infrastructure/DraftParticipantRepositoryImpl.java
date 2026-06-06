package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class DraftParticipantRepositoryImpl implements DraftParticipantRepository {

    private final DraftParticipantJpaRepository draftParticipantJpaRepository;

    @Override
    public DraftParticipant save(DraftParticipant draftParticipant) {
        return draftParticipantJpaRepository.save(draftParticipant);
    }

    @Override
    public Optional<DraftParticipant> findByParticipantToken(String participantToken) {
        return draftParticipantJpaRepository.findByParticipantToken(participantToken);
    }

    @Override
    public List<DraftParticipant> findAllByRoomIdOrderByTurnOrderAsc(Long roomId) {
        return draftParticipantJpaRepository.findAllByRoomIdOrderByTurnOrderAsc(roomId);
    }

    @Override
    public boolean existsByRoomIdAndSelectedCoachName(Long roomId, String coachName) {
        return draftParticipantJpaRepository.existsByRoomIdAndSelectedCoachName(roomId, coachName);
    }

    @Override
    public List<DraftParticipant> findAllByRoomId(Long roomId) {
        return draftParticipantJpaRepository.findAllByRoomId(roomId);
    }

    @Override
    public Optional<DraftParticipant> findByRoomIdAndParticipantToken(Long roomId, String participantToken) {
        return draftParticipantJpaRepository.findByRoomIdAndParticipantToken(roomId, participantToken);
    }

}

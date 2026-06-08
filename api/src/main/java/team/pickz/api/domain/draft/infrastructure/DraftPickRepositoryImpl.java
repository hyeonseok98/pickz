package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
import team.pickz.api.domain.draft.domain.repository.DraftPickRepository;
import team.pickz.api.domain.draft.domain.type.Position;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class DraftPickRepositoryImpl implements DraftPickRepository {

    private final DraftPickJpaRepository draftPickJpaRepository;

    @Override
    public Boolean existsByRoomIdAndStreamerName(Long roomId, String streamerName) {
        return draftPickJpaRepository.existsByRoomIdAndStreamerName(roomId, streamerName);
    }

    @Override
    public int countDistinctTeamIdByDraftRoomIdAndPosition(Long roomId, Position position) {
        return draftPickJpaRepository.countDistinctParticipantIdByDraftRoomIdAndPosition(roomId, position);
    }

    @Override
    public List<Long> findParticipantIdsByDraftRoomIdAndPosition(Long roomId, Position position) {
        return draftPickJpaRepository.findParticipantIdsByDraftRoomIdAndPosition(roomId, position);
    }

    @Override
    public void save(DraftPick draftPick) {
        draftPickJpaRepository.save(draftPick);
    }

}

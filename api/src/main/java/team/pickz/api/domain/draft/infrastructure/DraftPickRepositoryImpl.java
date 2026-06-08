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
    public Boolean existsByRoomIdAndStreamerId(Long roomId, String streamerId) {
        return draftPickJpaRepository.existsByRoomIdAndStreamerId(roomId, streamerId);
    }

    @Override
    public int countDistinctTeamIdByDraftRoomIdAndPosition(Long roomId, Position position) {
        return draftPickJpaRepository.countDistinctParticipantIdByDraftRoomIdAndPosition(roomId, position);
    }

    @Override
    public List<Long> findTeamIdsByDraftRoomIdAndPosition(Long roomId, Position position) {
        return List.of();
    }

    @Override
    public void save(DraftPick draftPick) {
        draftPickJpaRepository.save(draftPick);
    }

}

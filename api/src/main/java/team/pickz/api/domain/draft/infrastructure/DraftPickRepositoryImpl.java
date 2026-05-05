package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
import team.pickz.api.domain.draft.domain.repository.DraftPickRepository;

@Repository
@RequiredArgsConstructor
public class DraftPickRepositoryImpl implements DraftPickRepository {

    private final DraftPickJpaRepository draftPickJpaRepository;

    @Override
    public Boolean existsByRoomIdAndStreamerId(Long roomId, String streamerId) {
        return draftPickJpaRepository.existsByRoomIdAndStreamerId(roomId, streamerId);
    }

    @Override
    public void save(DraftPick draftPick) {
        draftPickJpaRepository.save(draftPick);
    }

}

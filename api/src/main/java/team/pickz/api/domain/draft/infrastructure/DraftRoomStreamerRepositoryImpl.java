package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftRoomStreamer;
import team.pickz.api.domain.draft.domain.repository.DraftRoomStreamerRepository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class DraftRoomStreamerRepositoryImpl implements DraftRoomStreamerRepository {

    private final DraftRoomStreamerJpaRepository draftRoomStreamerJpaRepository;

    @Override
    public void deleteAllByRoomId(Long roomId) {
        draftRoomStreamerJpaRepository.deleteAllByRoomId(roomId);
    }

    @Override
    public DraftRoomStreamer save(DraftRoomStreamer streamer) {
        return draftRoomStreamerJpaRepository.save(streamer);
    }

    @Override
    public List<DraftRoomStreamer> findAllByRoomId(Long roomId) {
        return draftRoomStreamerJpaRepository.findAllByRoomId(roomId);
    }

    @Override
    public Optional<DraftRoomStreamer> findByRoomIdAndStreamerName(Long roomId, String streamerId) {
        return draftRoomStreamerJpaRepository.findByRoomIdAndStreamerName(roomId, streamerId);
    }

}

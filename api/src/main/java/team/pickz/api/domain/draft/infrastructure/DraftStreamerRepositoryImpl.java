package team.pickz.api.domain.draft.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.draft.domain.entity.DraftStreamer;
import team.pickz.api.domain.draft.domain.repository.DraftStreamerRepository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class DraftStreamerRepositoryImpl implements DraftStreamerRepository {

    private final DraftStreamerJpaRepository draftRoomStreamerJpaRepository;

    @Override
    public void deleteAllByRoomId(Long roomId) {
        draftRoomStreamerJpaRepository.deleteAllByRoomId(roomId);
    }

    @Override
    public DraftStreamer save(DraftStreamer streamer) {
        return draftRoomStreamerJpaRepository.save(streamer);
    }

    @Override
    public List<DraftStreamer> findAllByRoomId(Long roomId) {
        return draftRoomStreamerJpaRepository.findAllByRoomId(roomId);
    }

    @Override
    public Optional<DraftStreamer> findByRoomIdAndStreamerName(Long roomId, String streamerName) {
        return draftRoomStreamerJpaRepository.findByRoomIdAndStreamerName(roomId, streamerName);
    }

}

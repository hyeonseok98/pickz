package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftStreamer;

import java.util.List;
import java.util.Optional;

public interface DraftStreamerRepository {

    void deleteAllByRoomId(Long roomId);

    DraftStreamer save(DraftStreamer streamer);

    List<DraftStreamer> findAllByRoomId(Long roomId);

    Optional<DraftStreamer> findByRoomIdAndStreamerName(Long roomId, String streamerId);

}

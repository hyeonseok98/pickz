package team.pickz.api.domain.draft.domain.repository;

import team.pickz.api.domain.draft.domain.entity.DraftRoomStreamer;

import java.util.List;
import java.util.Optional;

public interface DraftRoomStreamerRepository {

    void deleteAllByRoomId(Long roomId);

    DraftRoomStreamer save(DraftRoomStreamer streamer);

    List<DraftRoomStreamer> findAllByRoomId(Long roomId);

    Optional<DraftRoomStreamer> findByRoomIdAndStreamerName(Long roomId, String streamerId);

}

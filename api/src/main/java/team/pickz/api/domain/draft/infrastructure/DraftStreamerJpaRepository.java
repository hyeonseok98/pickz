package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftStreamer;

import java.util.List;
import java.util.Optional;

public interface DraftStreamerJpaRepository extends JpaRepository<DraftStreamer, Long> {

    void deleteAllByRoomId(Long roomId);

    List<DraftStreamer> findAllByRoomId(Long roomId);

    Optional<DraftStreamer> findByRoomIdAndStreamerName(Long roomId, String streamerName);

}

package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftRoomStreamer;

import java.util.List;
import java.util.Optional;

public interface DraftRoomStreamerJpaRepository extends JpaRepository<DraftRoomStreamer, Long> {

    void deleteAllByRoomId(Long roomId);

    List<DraftRoomStreamer> findAllByRoomId(Long roomId);

    Optional<DraftRoomStreamer> findByRoomIdAndStreamerName(Long roomId, String streamerId);

}

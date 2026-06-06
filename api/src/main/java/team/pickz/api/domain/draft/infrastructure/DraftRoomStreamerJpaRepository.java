package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.draft.domain.entity.DraftRoomStreamer;

import java.util.List;

public interface DraftRoomStreamerJpaRepository extends JpaRepository<DraftRoomStreamer, Long> {

    void deleteAllByRoomId(Long roomId);

    List<DraftRoomStreamer> findAllByRoomId(Long roomId);

}

package team.pickz.api.domain.streamer.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.streamer.domain.Streamer;

import java.util.List;

public interface StreamerJpaRepository extends JpaRepository<Streamer, Long> {

    List<Streamer> findByChannelIdIn(List<String> channelIds);

    List<Streamer> findTop20ByChannelNameContainingIgnoreCaseOrderByChannelNameAsc(String keyword);

}

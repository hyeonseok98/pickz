package team.pickz.api.domain.streamer.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import team.pickz.api.domain.streamer.domain.Streamer;

import java.util.List;

public interface StreamerJpaRepository extends JpaRepository<Streamer, Long> {

    List<Streamer> findByChannelIdIn(List<String> channelIds);

    Page<Streamer> findByChannelNameContainingIgnoreCase(String keyword, Pageable pageable);

}

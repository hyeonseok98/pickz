package team.pickz.api.domain.streamer.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StreamerRepository {

    void saveAll(List<Streamer> streamers);

    List<Streamer> findByChannelIdIn(List<String> channelIds);

    Page<Streamer> findByChannelNameContainingIgnoreCase(String keyword, Pageable pageable);

}

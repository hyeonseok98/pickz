package team.pickz.api.domain.streamer.domain;

import java.util.List;

public interface StreamerRepository {

    void saveAll(List<Streamer> streamers);

    List<Streamer> findByChannelIdIn(List<String> channelIds);

    List<Streamer> findTop20ByChannelNameContainingIgnoreCaseOrderByChannelNameAsc(String keyword);

}

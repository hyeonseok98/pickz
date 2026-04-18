package team.pickz.api.domain.streamer.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import team.pickz.api.domain.streamer.domain.Streamer;
import team.pickz.api.domain.streamer.domain.StreamerRepository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class StreamerRepositoryImpl implements StreamerRepository {

    private final StreamerJpaRepository streamerJpaRepository;

    @Override
    public void saveAll(List<Streamer> streamers) {
        streamerJpaRepository.saveAll(streamers);
    }

    @Override
    public List<Streamer> findByChannelIdIn(List<String> channelIds) {
        return streamerJpaRepository.findByChannelIdIn(channelIds);
    }

    @Override
    public List<Streamer> findTop20ByChannelNameContainingIgnoreCaseOrderByChannelNameAsc(String keyword) {
        return streamerJpaRepository.findTop20ByChannelNameContainingIgnoreCaseOrderByChannelNameAsc(keyword);
    }

}

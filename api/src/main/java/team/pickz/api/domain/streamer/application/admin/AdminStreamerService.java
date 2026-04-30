package team.pickz.api.domain.streamer.application.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.streamer.domain.Streamer;
import team.pickz.api.domain.streamer.domain.StreamerRepository;
import team.pickz.api.infra.chzzk.client.ChzzkClient;
import team.pickz.api.infra.chzzk.dto.ChzzkChannelResponse;
import team.pickz.api.infra.chzzk.dto.ChzzkLiveResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStreamerService {

    private final ChzzkClient chzzkClient;
    private final StreamerRepository streamerRepository;
    private static final int CHUNK_SIZE = 20;

    @Transactional
    public void registerStreamers(List<String> targetChannelIds) {
        if(targetChannelIds == null || targetChannelIds.isEmpty()) {
            return;
        }
        List<List<String>> partitionedIds = partitionList(targetChannelIds, CHUNK_SIZE);

        for(List<String> chunk : partitionedIds) {
            List<ChzzkChannelResponse> externalChannels = chzzkClient.getChannels(chunk);

            List<Streamer> existingStreamers = streamerRepository.findByChannelIdIn(chunk);
            Map<String, Streamer> existingMap = existingStreamers.stream()
                    .collect(Collectors.toMap(Streamer::getChannelId, s -> s));

            List<Streamer> toSave = new ArrayList<>();
            for (ChzzkChannelResponse ext : externalChannels) {
                Streamer existing = existingMap.get(ext.channelId());
                if (existing != null) {
                    existing.updateProfile(ext.channelId(), ext.channelName(), ext.channelImageUrl());
                } else {
                    toSave.add(Streamer.from(ext.channelId(), ext.channelName(), ext.channelImageUrl()));
                }
            }

            if (!toSave.isEmpty()) {
                streamerRepository.saveAll(toSave);
            }
        }
    }

    private <T> List<List<T>> partitionList(List<T> list, int size) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            partitions.add(new ArrayList<>(list.subList(i, Math.min(list.size(), i + size))));
        }
        return partitions;
    }

    public List<ChzzkLiveResponse> getLiveStreamers() {
        return chzzkClient.getLives();
    }

}

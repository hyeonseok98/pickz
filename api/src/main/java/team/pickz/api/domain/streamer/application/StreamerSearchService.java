package team.pickz.api.domain.streamer.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.streamer.application.dto.StreamerSearchResponse;
import team.pickz.api.domain.streamer.domain.StreamerRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StreamerSearchService {

    private final StreamerRepository streamerRepository;

    public List<StreamerSearchResponse> searchByKeyword(String keyword) {
        if(keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        return streamerRepository.findTop20ByChannelNameContainingIgnoreCaseOrderByChannelNameAsc(keyword.trim())
                .stream()
                .map(StreamerSearchResponse::from)
                .toList();
    }

}

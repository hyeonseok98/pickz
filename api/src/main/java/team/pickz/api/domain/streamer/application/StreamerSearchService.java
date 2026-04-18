package team.pickz.api.domain.streamer.application;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.streamer.application.dto.StreamerSearchResponse;
import team.pickz.api.domain.streamer.domain.StreamerRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StreamerSearchService {

    private final StreamerRepository streamerRepository;

    public Page<StreamerSearchResponse> searchByKeyword(String keyword, int page, int size) {
        if(keyword == null || keyword.trim().isEmpty()) {
            return Page.empty();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "channelName"));

        return streamerRepository.findByChannelNameContainingIgnoreCase(keyword.trim(), pageable)
                .map(StreamerSearchResponse::from);
    }

}

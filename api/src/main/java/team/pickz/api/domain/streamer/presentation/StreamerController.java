package team.pickz.api.domain.streamer.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.pickz.api.domain.streamer.application.StreamerSearchService;
import team.pickz.api.domain.streamer.application.dto.StreamerSearchResponse;

@RestController
@RequestMapping("/streamers")
@RequiredArgsConstructor
public class StreamerController {

    private final StreamerSearchService streamerSearchService;

    @GetMapping("/search")
    public ResponseEntity<Page<StreamerSearchResponse>> searchStreamers(
            @RequestParam(name = "keyword") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        Page<StreamerSearchResponse> result = streamerSearchService.searchByKeyword(keyword, page, size);

        return ResponseEntity.status(200).body(result);
    }

}

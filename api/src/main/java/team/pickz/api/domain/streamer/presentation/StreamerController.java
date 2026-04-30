package team.pickz.api.domain.streamer.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import team.pickz.api.domain.streamer.application.StreamerSearchService;
import team.pickz.api.domain.streamer.application.dto.StreamerResponse;

import java.util.List;

@RestController
@RequestMapping("/streamers")
@RequiredArgsConstructor
public class StreamerController implements StreamerDocsController{

    private final StreamerSearchService streamerSearchService;

    @GetMapping("/search")
    public ResponseEntity<List<StreamerResponse>> searchStreamers(
            @RequestParam(name = "keyword") String keyword
    ) {
        List<StreamerResponse> response = streamerSearchService.searchByKeyword(keyword);

        return ResponseEntity.status(200).body(response);
    }

}

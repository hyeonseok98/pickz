package team.pickz.api.domain.streamer.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import team.pickz.api.domain.streamer.application.dto.StreamerSearchResponse;

import java.util.List;

@Tag(name = "Streamer", description = "스트리머 관련 API")
@RequestMapping("/streamers")
public interface StreamerDocsController {

    @Operation(
            summary = "스트리머 검색",
            description = "채널명으로 스트리머를 검색합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
    })
    @GetMapping("/search")
    ResponseEntity<List<StreamerSearchResponse>> searchStreamers(
            @RequestParam(name = "keyword") String keyword
    );

}

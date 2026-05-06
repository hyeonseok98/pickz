package team.pickz.api.domain.draft.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import team.pickz.api.domain.draft.application.dto.request.PickMessageRequest;

@Tag(name = "Draft WebSocket", description = "드래프트 게임 진행 웹소켓 API")
public interface DraftMessageDocsController {

    @Operation(
            summary = "스트리머 픽",
            description = "자신의 턴에 특정 스트리머를 픽합니다.<br>" +
                    "STOMP Publish Destination: `/app/drafts/rooms/{roomId}/pick`<br>" +
                    "정상 처리 시 응답 (Subscribe): `/topic/drafts/rooms/{roomId}/pick`"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "픽 성공 (모든 참여자에게 브로드캐스팅)"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (자신의 턴이 아님, 이미 픽된 스트리머, 유효하지 않은 참여자 등)",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    @MessageMapping("/drafts/rooms/{roomId}/pick")
    void pickStreamer(
            @DestinationVariable Long roomId,
            @Payload PickMessageRequest message
    );

}

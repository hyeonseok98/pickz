package team.pickz.api.domain.draft.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.domain.draft.application.dto.request.RoomConfigureRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomInitRequest;
import team.pickz.api.domain.draft.application.dto.response.ParticipantResponse;
import team.pickz.api.domain.draft.application.dto.response.RoomInitResponse;
import team.pickz.api.global.annotation.MemberId;

@Tag(name = "Draft Room API", description = "드래프트 관련 API")
@RequestMapping("/drafts/rooms")
public interface DraftRoomDocsController {

    @Operation(
            summary = "방(대기실) 초기 생성",
            description = "방장이 드래프트 모드와 룰을 선택하여 대기실을 초기 생성합니다. 초대 코드와 방장 토큰이 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "방 생성 성공")
    })
    @PostMapping
    ResponseEntity<RoomInitResponse> initRoom(
            //@Parameter(hidden = true) @MemberId Long hostId,
            @Valid @RequestBody RoomInitRequest request
    );

    @Operation(
            summary = "방 참가 (초대 코드)",
            description = "초대 코드를 통해 대기실에 참가합니다.<br>" +
                    "이 API 성공 시 서버에서 /topic/drafts/rooms/{roomId}/participants 경로로 갱신된 참여자 목록을 웹소켓 브로드캐스팅합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "참가 성공 (참여자 토큰 반환)"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 초대 코드 또는 방 인원 초과/상태 오류",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    @SecurityRequirements(value = {})
    @PostMapping("invites/{inviteCode}/participants")
    ResponseEntity<ParticipantResponse> joinRoom(
            @Parameter(description = "초대 코드", example = "X7a9P2K")
            @PathVariable("inviteCode") String inviteCode
    );

    @Operation(
            summary = "방 설정 완료 및 드래프트 시작",
            description = "방장이 팀 개수, 인원 등 최종 설정을 완료하고 드래프트를 시작합니다.<br>" +
                    "이 API 성공 시 서버에서 /topic/drafts/rooms/{roomId} 경로로 드래프트 시작 및 화면 전환 웹소켓 이벤트를 브로드캐스팅합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "설정 완료 및 시작 성공 (데이터 반환 없음)"),
            @ApiResponse(responseCode = "400", description = "방장이 아니거나, 유효하지 않은 설정값 (예: 인원수 불일치)", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PatchMapping("/{roomId}/settings")
    ResponseEntity<Void> configureAndStartRoom(
            @Parameter(description = "드래프트 방 ID", example = "1")
            @PathVariable("roomId") Long roomId,

            @Parameter(description = "방장의 참여자 토큰", in = ParameterIn.HEADER, required = true)
            @RequestHeader("X-Participant-Token") String participantToken,

            @Valid @RequestBody RoomConfigureRequest request
    );

}

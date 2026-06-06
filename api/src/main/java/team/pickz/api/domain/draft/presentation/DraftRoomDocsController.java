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
import team.pickz.api.domain.draft.application.dto.request.CoachSelectionRequest;
import team.pickz.api.domain.draft.application.dto.request.DraftRoomStreamerRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomConfigureRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomInitRequest;
import team.pickz.api.domain.draft.application.dto.response.DraftPlayStateResponse;
import team.pickz.api.domain.draft.application.dto.response.DraftRoomStreamerResponse;
import team.pickz.api.domain.draft.application.dto.response.ParticipantResponse;
import team.pickz.api.domain.draft.application.dto.response.RoomInitResponse;
import team.pickz.api.global.annotation.MemberId;

import java.util.List;

@Tag(name = "Draft Room API", description = "드래프트 관련 API")
@RequestMapping("/drafts/rooms")
public interface DraftRoomDocsController {

    @Operation(
            summary = "방(대기실) 초기 생성",
            description = "방장이 드래프트 방식, 참가 방식, 프리셋 등을 선택하여 대기실을 초기 생성합니다. 초대 코드와 방장 토큰이 반환됩니다."
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
            summary = "스트리머 풀 설정 (방장 전용)",
            description = "방장이 팀 슬롯별, 라인별 스트리머 배치를 설정하여 DB에 저장합니다. 기존에 설정된 풀이 있다면 덮어씁니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "스트리머 풀 설정 성공"),
            @ApiResponse(responseCode = "400", description = "방장이 아니거나 유효하지 않은 방 정보", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PostMapping("/{roomId}/streamers")
    ResponseEntity<Void> saveDraftRoomStreamers(
            @Parameter(description = "드래프트 방 ID", example = "1")
            @PathVariable("roomId") Long roomId,

            @Parameter(description = "방장의 참여자 토큰", in = ParameterIn.HEADER, required = true)
            @RequestHeader("X-Participant-Token") String participantToken,

            @Valid @RequestBody List<DraftRoomStreamerRequest> requests
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
            summary = "감독 및 픽 순서 선택",
            description = "대기실에 들어온 참가자가 자신이 맡을 감독(팀)을 선택하여 자신의 픽 순서를 배정받습니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "감독 선택 완료"),
            @ApiResponse(responseCode = "400", description = "이미 다른 참가자가 선택한 감독이거나 유효하지 않은 요청", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PatchMapping("/{roomId}/participants/coach")
    ResponseEntity<Void> selectCoach(
            @Parameter(description = "드래프트 방 ID", example = "1")
            @PathVariable("roomId") Long roomId,

            @Parameter(description = "참여자 토큰", in = ParameterIn.HEADER, required = true)
            @RequestHeader("X-Participant-Token") String participantToken,

            @Valid @RequestBody CoachSelectionRequest request
    );

    @Operation(
            summary = "설정된 스트리머 풀 조회",
            description = "라인별 스트리머 풀 데이터를 불러옵니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "스트리머 풀 조회 성공")
    })
    @GetMapping("/{roomId}/streamers")
    ResponseEntity<DraftRoomStreamerResponse> getDraftRoomStreamers(
            @Parameter(description = "드래프트 방 ID", example = "1")
            @PathVariable("roomId") Long roomId
    );

    @Operation(
            summary = "방 설정 완료 및 드래프트 시작 (방장 전용)",
            description = "스트리머 풀 설정과 참가자들의 감독 선택이 모두 끝난 후 방장이 드래프트를 시작합니다.<br>" +
                    "이 API 성공 시 서버에서 /topic/drafts/rooms/{roomId} 경로로 드래프트 시작 및 화면 전환 웹소켓 이벤트를 브로드캐스팅합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "드래프트 시작 성공"),
            @ApiResponse(responseCode = "400", description = "방장이 아니거나, 아직 모든 참가자가 감독을 선택하지 않은 경우", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PostMapping("/{roomId}/start")
    ResponseEntity<Void> startDraft(
            @Parameter(description = "드래프트 방 ID", example = "1")
            @PathVariable("roomId") Long roomId,

            @Parameter(description = "방장의 참여자 토큰", in = ParameterIn.HEADER, required = true)
            @RequestHeader("X-Participant-Token") String participantToken
    );

    @Operation(
            summary = "드래프트 게임 화면 상태 조회",
            description = "드래프트 게임(플레이) 화면 진입 시 필요한 방 상태, 참가자(감독) 배치 정보, 스트리머 풀 등 모든 초기 설정 데이터를 한 번에 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "게임 상태 조회 성공")
    })
    @GetMapping("/{roomId}/state")
    ResponseEntity<DraftPlayStateResponse> getDraftPlayState(
            @Parameter(description = "드래프트 방 ID", example = "1")
            @PathVariable("roomId") Long roomId
    );

//    @Operation(
//            summary = "방 설정 완료 및 드래프트 시작",
//            description = "방장이 팀 개수, 인원 등 최종 설정을 완료하고 드래프트를 시작합니다.<br>" +
//                    "이 API 성공 시 서버에서 /topic/drafts/rooms/{roomId} 경로로 드래프트 시작 및 화면 전환 웹소켓 이벤트를 브로드캐스팅합니다."
//    )
//    @ApiResponses({
//            @ApiResponse(responseCode = "204", description = "설정 완료 및 시작 성공 (데이터 반환 없음)"),
//            @ApiResponse(responseCode = "400", description = "방장이 아니거나, 유효하지 않은 설정값 (예: 인원수 불일치)", content = @Content(schema = @Schema(implementation = String.class)))
//    })
//    @PatchMapping("/{roomId}/settings")
//    ResponseEntity<Void> configureAndStartRoom(
//            @Parameter(description = "드래프트 방 ID", example = "1")
//            @PathVariable("roomId") Long roomId,
//
//            @Parameter(description = "방장의 참여자 토큰", in = ParameterIn.HEADER, required = true)
//            @RequestHeader("X-Participant-Token") String participantToken,
//
//            @Valid @RequestBody RoomConfigureRequest request
//    );

}

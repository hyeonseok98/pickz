package team.pickz.api.domain.draft.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.domain.draft.application.DraftRoomService;
import team.pickz.api.domain.draft.application.dto.request.RoomCreateRequest;
import team.pickz.api.domain.draft.application.dto.response.ParticipantTokenResponse;
import team.pickz.api.domain.draft.application.dto.response.RoomCreateResponse;
import team.pickz.api.global.annotation.MemberId;

@RestController
@RequestMapping("/drafts/rooms")
@RequiredArgsConstructor
public class DraftRoomController {

    private final DraftRoomService draftRoomService;

    @PostMapping
    public ResponseEntity<RoomCreateResponse> createRoom(
            @MemberId Long hostId,
            @Valid @RequestBody RoomCreateRequest request
    ) {
        RoomCreateResponse response = draftRoomService.createRoom(
                hostId,
                request.mode(),
                request.ruleName(),
                request.teamCount(),
                request.teamSize()
        );

        return ResponseEntity.status(200).body(response);
    }

    @PostMapping("/{inviteCode}/join")
    public ResponseEntity<ParticipantTokenResponse> joinRoom(
            @PathVariable("inviteCode") String inviteCode
    ) {
        ParticipantTokenResponse response = draftRoomService.joinRoom(inviteCode);
        return ResponseEntity.status(200).body(response);
    }

    @PostMapping("/{roomId}/start")
    public ResponseEntity<Void> startDraft(
            @PathVariable("roomId") Long roomId,
            @RequestHeader("X-Participant-Token") String participantToken // 방장 토큰
    ) {
        draftRoomService.startDraft(roomId, participantToken);
        return ResponseEntity.ok().build();
    }

}

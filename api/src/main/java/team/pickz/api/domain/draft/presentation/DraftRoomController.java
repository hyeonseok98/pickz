package team.pickz.api.domain.draft.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import team.pickz.api.domain.draft.application.DraftRoomService;
import team.pickz.api.domain.draft.application.dto.request.RoomConfigureRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomInitRequest;
import team.pickz.api.domain.draft.application.dto.response.ParticipantTokenResponse;
import team.pickz.api.domain.draft.application.dto.response.RoomInitResponse;
import team.pickz.api.global.annotation.MemberId;

import java.net.URI;

@RequiredArgsConstructor
@RequestMapping("/drafts/rooms")
@RestController
public class DraftRoomController {

    private final DraftRoomService draftRoomService;

    @PostMapping
    public ResponseEntity<RoomInitResponse> initRoom(
            @MemberId Long hostId,
            @Valid @RequestBody RoomInitRequest request
    ) {
        RoomInitResponse response = draftRoomService.initRoom(
                hostId,
                request.mode(),
                request.ruleName()
        );

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{roomId}")
                .buildAndExpand(response.roomId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PostMapping("invites/{inviteCode}/participants")
    public ResponseEntity<ParticipantTokenResponse> joinRoom(
            @PathVariable("inviteCode") String inviteCode
    ) {
        ParticipantTokenResponse response = draftRoomService.joinRoom(inviteCode);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{roomId}/settings")
    public ResponseEntity<Void> configureAndStartRoom(
            @PathVariable("roomId") Long roomId,
            @RequestHeader("X-Participant-Token") String participantToken, // 방장 토큰
            @Valid @RequestBody RoomConfigureRequest request
    ) {
        draftRoomService.configureAndStartRoom(roomId, participantToken, request);

        return ResponseEntity.noContent().build();
    }

}

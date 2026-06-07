package team.pickz.api.domain.draft.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import team.pickz.api.domain.draft.application.DraftParticipantService;
import team.pickz.api.domain.draft.application.DraftRoomService;
import team.pickz.api.domain.draft.application.DraftStreamerService;
import team.pickz.api.domain.draft.application.dto.request.CoachSelectionRequest;
import team.pickz.api.domain.draft.application.dto.request.DraftRoomStreamerRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomConfigureRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomInitRequest;
import team.pickz.api.domain.draft.application.dto.response.DraftPlayStateResponse;
import team.pickz.api.domain.draft.application.dto.response.DraftRoomStreamerResponse;
import team.pickz.api.domain.draft.application.dto.response.ParticipantResponse;
import team.pickz.api.domain.draft.application.dto.response.RoomInitResponse;
import team.pickz.api.global.annotation.MemberId;

import java.net.URI;
import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/drafts/rooms")
@RestController
public class DraftRoomController implements DraftRoomDocsController {

    private final DraftRoomService draftRoomService;
    private final DraftStreamerService draftStreamerService;
    private final DraftParticipantService draftParticipantService;

    @PostMapping
    public ResponseEntity<RoomInitResponse> initRoom(
            //@MemberId Long hostId,
            @Valid @RequestBody RoomInitRequest request
    ) {
        RoomInitResponse response = draftRoomService.initRoom(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{roomId}")
                .buildAndExpand(response.roomId())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PostMapping("/{roomId}/streamers")
    public ResponseEntity<Void> saveDraftRoomStreamers(
            @PathVariable("roomId") Long roomId,
            @RequestHeader("X-Participant-Token") String participantToken,
            @Valid @RequestBody List<DraftRoomStreamerRequest> requests
    ) {
        draftStreamerService.saveDraftRoomStreamers(roomId, participantToken, requests);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/streamers")
    public ResponseEntity<DraftRoomStreamerResponse> getDraftRoomStreamers(
            @PathVariable("roomId") Long roomId
    ) {
        DraftRoomStreamerResponse response = draftStreamerService.getDraftRoomStreamers(roomId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("invites/{inviteCode}/participants")
    public ResponseEntity<ParticipantResponse> joinRoom(
            @PathVariable("inviteCode") String inviteCode
    ) {
        ParticipantResponse response = draftParticipantService.joinRoom(inviteCode);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{roomId}/participants/coach")
    public ResponseEntity<Void> selectCoach(
            @PathVariable("roomId") Long roomId,
            @RequestHeader("X-Participant-Token") String participantToken,
            @Valid @RequestBody CoachSelectionRequest request
    ) {
        draftParticipantService.selectCoach(roomId, participantToken, request.coachName(), request.targetTurnOrder());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roomId}/start")
    public ResponseEntity<Void> startDraft(
            @PathVariable("roomId") Long roomId,
            @RequestHeader("X-Participant-Token") String participantToken
    ) {
        draftRoomService.startDraft(roomId, participantToken);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/state")
    public ResponseEntity<DraftPlayStateResponse> getDraftPlayState(
            @PathVariable("roomId") Long roomId
    ) {
        DraftPlayStateResponse response = draftStreamerService.getDraftPlayState(roomId);

        return ResponseEntity.ok(response);
    }

}

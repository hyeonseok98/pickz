package team.pickz.api.domain.draft.presentation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.domain.draft.application.DraftRoomService;
import team.pickz.api.domain.draft.application.dto.RoomCreateRequest;
import team.pickz.api.domain.draft.application.dto.RoomCreateResponse;
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
        String inviteCode = draftRoomService.createRoom(
                hostId,
                request.maxParticipants(),
                request.ruleName()
        );

        return ResponseEntity.ok(new RoomCreateResponse(inviteCode));
    }

    @PostMapping("/{inviteCode}/join")
    public ResponseEntity<Void> joinRoom(
            @MemberId Long memberId,
            @PathVariable("inviteCode") String inviteCode
    ) {
        draftRoomService.joinRoom(inviteCode, memberId);
        return ResponseEntity.ok().build();
    }
}

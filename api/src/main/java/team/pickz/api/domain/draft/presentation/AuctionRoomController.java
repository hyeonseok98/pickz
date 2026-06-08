package team.pickz.api.domain.draft.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.domain.draft.application.AuctionRoomService;

@RestController
@RequestMapping("/drafts/rooms/{roomId}/auction")
@RequiredArgsConstructor
public class AuctionRoomController {

    private final AuctionRoomService auctionRoomService;

    /**
     * 경매 드래프트 시작 API
     * 방장이 호출 시 DB 데이터를 읽어 메모리에 방을 세팅하고 경매 타이머를 시작합니다.
     */
    @PostMapping("/start")
    public ResponseEntity<Void> startAuction(@PathVariable("roomId") Long roomId) {
        auctionRoomService.startAuctionDraft(roomId);
        return ResponseEntity.ok().build();
    }
}

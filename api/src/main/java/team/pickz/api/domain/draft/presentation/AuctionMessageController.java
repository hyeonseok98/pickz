package team.pickz.api.domain.draft.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import team.pickz.api.domain.draft.application.AuctionPlayService;
import team.pickz.api.domain.draft.application.dto.request.AuctionBidRequest;

@Controller
@RequiredArgsConstructor
public class AuctionMessageController {

    private final AuctionPlayService auctionPlayService;

    /**
     * 입찰 요청 처리 (PUB)
     * 프론트엔드 전송 경로: /app/draft/room/{roomId}/bid
     */
    @MessageMapping("/draft/room/{roomId}/bid")
    public void handleBid(
            @DestinationVariable("roomId") Long roomId,
            @Payload AuctionBidRequest request
    ) {
        // 서비스 로직 호출 (유효성 검사 및 최고가 갱신 로직 실행)
        auctionPlayService.handleBid(roomId, request.getTeamId(), request.getAmount());
    }
}
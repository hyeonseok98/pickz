package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.entity.DraftStreamer;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftStreamerRepository;
import team.pickz.api.domain.draft.domain.type.RoomStatus;
import team.pickz.api.domain.draft.infrastructure.websocket.AuctionRoomState;
import team.pickz.api.domain.draft.infrastructure.websocket.AuctionSessionManager;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionRoomService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final DraftStreamerRepository draftStreamerRepository;

    private final AuctionSessionManager auctionSessionManager;
    private final AuctionPlayService auctionPlayService;

    @Transactional
    public void startAuctionDraft(Long roomId) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        room.start();

        List<AuctionRoomState.TeamInfo> teamInfos = draftParticipantRepository.findAllByRoomId(roomId)
                .stream()
                .map(p -> new AuctionRoomState.TeamInfo(p.getId(), p.getNickname()))
                .collect(Collectors.toList());

        List<DraftStreamer> draftStreamers = draftStreamerRepository.findAllByRoomId(roomId);
        List<AuctionRoomState.StreamerAuctionItem> auctionItems = draftStreamers.stream()
                .map(s -> new AuctionRoomState.StreamerAuctionItem(
                        s.getId(),
                        s.getStreamerName(),
                        s.getImageUrl(),
                        s.getPosition()
                ))
                .collect(Collectors.toList());

        auctionSessionManager.createRoomState(roomId, teamInfos, auctionItems);

        // 5. 초기화된 방 상태를 클라이언트에 동기화 (전체 상태 브로드캐스트)
        auctionPlayService.broadcastRoomState(roomId, auctionSessionManager.getRoomState(roomId));

        // 6. 첫 번째 라운드 타이머 스케줄링 시작 (STANDBY 10초 돌입)
        auctionPlayService.scheduleNextRound(roomId);
    }

}

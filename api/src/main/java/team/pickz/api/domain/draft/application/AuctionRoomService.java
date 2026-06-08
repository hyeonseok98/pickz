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

    @Transactional(readOnly = true)
    public void setupAuctionAndStartTimer(Long roomId) {

        // 1. 참가자(팀) 정보 조회
        List<AuctionRoomState.TeamInfo> teamInfos = draftParticipantRepository.findAllByRoomId(roomId)
                .stream()
                .map(p -> new AuctionRoomState.TeamInfo(p.getId(), p.getNickname()))
                .collect(Collectors.toList());

        // 2. 경매 대상 스트리머 정보 조회
        List<DraftStreamer> draftStreamers = draftStreamerRepository.findAllByRoomId(roomId);
        List<AuctionRoomState.StreamerAuctionItem> auctionItems = draftStreamers.stream()
                .map(s -> new AuctionRoomState.StreamerAuctionItem(
                        s.getId(),
                        s.getStreamerName(),
                        s.getImageUrl(),
                        s.getPosition()
                ))
                .collect(Collectors.toList());

        // 3. 인메모리 방 상태 세팅
        auctionSessionManager.createRoomState(roomId, teamInfos, auctionItems);

        // 4. 초기 상태 동기화 및 라운드(타이머) 시작
        auctionPlayService.broadcastRoomState(roomId, auctionSessionManager.getRoomState(roomId));
        auctionPlayService.scheduleNextRound(roomId);
    }

}

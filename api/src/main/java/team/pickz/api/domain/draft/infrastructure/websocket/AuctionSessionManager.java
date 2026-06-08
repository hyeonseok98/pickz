package team.pickz.api.domain.draft.infrastructure.websocket;

import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 진행 중인 경매 드래프트 방의 실시간 상태를 인메모리로 관리하는 매니저 클래스
 */
@Component
public class AuctionSessionManager {

    // K: roomId, V: 해당 방의 실시간 경매 상태 객체
    // 동시성 문제를 방지하기 위해 ConcurrentHashMap 사용
    private final Map<Long, AuctionRoomState> roomStates = new ConcurrentHashMap<>();

    /**
     * 새로운 경매 방 상태 초기화 및 등록
     * (방장이 경매 시작 버튼을 눌렀을 때 호출)
     *
     * @param roomId 방 ID
     * @param teamIds 참여하는 4개 팀의 ID 리스트
     * @param streamers 경매 대상 스트리머(선수) 리스트
     */
    public void createRoomState(Long roomId, List<AuctionRoomState.TeamInfo> teamIds, List<AuctionRoomState.StreamerAuctionItem> streamers) {
        if (roomStates.containsKey(roomId)) {
            throw new IllegalStateException("이미 실행 중인 경매 방입니다. roomId: " + roomId);
        }

        AuctionRoomState newState = new AuctionRoomState(roomId, teamIds, streamers);
        roomStates.put(roomId, newState);
    }

    /**
     * 특정 방의 경매 상태 조회
     *
     * @param roomId 방 ID
     * @return AuctionRoomState
     */
    public AuctionRoomState getRoomState(Long roomId) {
        AuctionRoomState state = roomStates.get(roomId);
        if (state == null) {
            // 실제 프로젝트의 Global Exception(예: CustomException)으로 변경하는 것을 권장합니다.
            throw new IllegalArgumentException("진행 중인 경매 방을 찾을 수 없습니다. roomId: " + roomId);
        }
        return state;
    }

    /**
     * 특정 방의 경매 상태 존재 여부 확인
     */
    public boolean isRoomActive(Long roomId) {
        return roomStates.containsKey(roomId);
    }

    /**
     * 경매 종료 시 메모리에서 방 상태 제거 (자원 해제)
     *
     * @param roomId 방 ID
     */
    public void removeRoomState(Long roomId) {
        roomStates.remove(roomId);
    }
}
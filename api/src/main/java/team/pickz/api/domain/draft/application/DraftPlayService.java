package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.response.PickResultResponse;
import team.pickz.api.domain.draft.application.event.DraftPickedEvent;
import team.pickz.api.domain.draft.application.util.RoomSequenceManager;
import team.pickz.api.domain.draft.domain.type.RoomStatus;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftPickRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.draft.domain.rule.DraftRule;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DraftPlayService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final DraftPickRepository draftPickRepository;
    private final DraftRule snakeDraftRule;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final RoomSequenceManager roomSequenceManager;

    @Transactional
    public void processPick(Long roomId, String participantToken, String streamerId) {
        DraftRoom room = draftRoomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        if(room.getStatus() == RoomStatus.DONE) {
            throw new IllegalArgumentException("드래프트가 종료되었습니다.");
        }

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomIdOrderByTurnOrderAsc(roomId);

        DraftParticipant requestor = participants.stream()
                .filter(p -> p.getParticipantToken().equals(participantToken))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        int nextTurnIndex = snakeDraftRule.calculateNextTurn(room.getCurrentPickCount(), room.getTeamCount());
        DraftParticipant expectedParticipant = participants.get(nextTurnIndex);

        if (!expectedParticipant.getParticipantToken().equals(participantToken)) {
            throw new IllegalArgumentException("현재 당신의 픽 차례가 아닙니다.");
        }

        if (draftPickRepository.existsByRoomIdAndStreamerId(roomId, streamerId)) {
            throw new IllegalArgumentException("이미 선택된 스트리머입니다.");
        }

        int currentRound = room.getCurrentPickCount() / room.getTeamCount();
        DraftPick pick = DraftPick.builder()
                .roomId(roomId)
                .participantId(requestor.getId())
                .streamerId(streamerId)
                .roundIndex(currentRound)
                .build();

        draftPickRepository.save(pick);

        room.incrementPickCount();
        if (room.getStatus() == RoomStatus.DONE) {
            roomSequenceManager.removeRoomSequence(roomId);
        }

        String nextTurnNickname = null;
        if (room.getStatus() != RoomStatus.DONE) {
            int nextExpectedTurnIndex = snakeDraftRule.calculateNextTurn(room.getCurrentPickCount(), room.getTeamCount());
            nextTurnNickname = participants.get(nextExpectedTurnIndex).getNickname();
        }

        PickResultResponse result = PickResultResponse.builder()
                .code("SUCCESS")
                .roomId(roomId)
                .pickedNickname(requestor.getNickname())
                .pickedStreamerId(streamerId)
                .nextTurnNickname(nextTurnNickname) // 다음 차례 유저의 닉네임을 UI에 표시
                .isDraftDone(room.getStatus() == RoomStatus.DONE)
                .build();

        applicationEventPublisher.publishEvent(
                DraftPickedEvent.builder()
                        .roomId(roomId)
                        .result(result)
                        .build()
        );
    }

}

package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.PickResult;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftPickRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.draft.domain.rule.DraftRule;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DraftPickService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository participantRepository;
    private final DraftPickRepository draftPickRepository;
    private final List<DraftRule> rules;

    @Transactional
    public PickResult processPick(Long roomId, Long memberId, String streamerId) {
        DraftRoom room = draftRoomRepository.findById(roomId);

        DraftParticipant currentTurnPlayer = participantRepository.findByDraftRoomAndTurnIndex(room, room.getCurrentTurnIndex());

        if (!currentTurnPlayer.getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("현재 당신의 픽 순서가 아닙니다.");
        }

        if (draftPickRepository.existsByDraftRoomIdAndStreamerId(roomId, streamerId)) {
            throw new IllegalArgumentException("이미 선택된 스트리머입니다.");
        }

        draftPickRepository.save(new DraftPick(roomId, memberId, streamerId, room.getCurrentRound()));

        DraftRule rule = rules.stream()
                .filter(r -> r.getRuleName().equals(room.getRuleName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 룰입니다."));

        boolean isRoundFinished = (room.getCurrentPickInRound() + 1) >= room.getMaxParticipants();
        int nextRound = isRoundFinished ? room.getCurrentRound() + 1 : room.getCurrentRound();
        int nextPickInRound = isRoundFinished ? 0 : room.getCurrentPickInRound() + 1;

        int nextTurnIndex = rule.calculateNextTurn(nextRound, nextPickInRound, room.getMaxParticipants());

        boolean isDraftDone = nextRound > 5;
        if (isDraftDone) {
            room.finish();
        } else {
            room.advanceTurn(nextRound, nextPickInRound, nextTurnIndex);
        }

        return new PickResult(roomId, memberId, streamerId, isDraftDone, nextTurnIndex, nextRound);
    }

}

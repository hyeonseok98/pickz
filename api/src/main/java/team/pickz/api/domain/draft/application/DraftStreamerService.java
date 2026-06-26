package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.StreamerInfo;
import team.pickz.api.domain.draft.application.dto.request.DraftRoomStreamerRequest;
import team.pickz.api.domain.draft.application.dto.response.*;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.entity.DraftStreamer;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.draft.domain.repository.DraftStreamerRepository;
import team.pickz.api.domain.draft.domain.type.Position;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DraftStreamerService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final DraftStreamerRepository draftStreamerRepository;

    @Transactional
    public SaveStreamerPoolResponse saveDraftRoomStreamers(Long roomId, String participantToken, List<DraftRoomStreamerRequest> requests) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        DraftParticipant requestor = draftParticipantRepository.findByRoomIdAndParticipantToken(roomId, participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 스트리머 풀을 설정할 수 있습니다.");
        }

        for (DraftRoomStreamerRequest req : requests) {
            room.validateTeamSlot(req.teamSlot());
        }

        draftStreamerRepository.deleteAllByRoomId(roomId);

        for (DraftRoomStreamerRequest req : requests) {
            savePositionStreamers(roomId, req.teamSlot(), Position.TOP, req.top());
            savePositionStreamers(roomId, req.teamSlot(), Position.JUG, req.jug());
            savePositionStreamers(roomId, req.teamSlot(), Position.MID, req.mid());
            savePositionStreamers(roomId, req.teamSlot(), Position.ADC, req.adc());
            savePositionStreamers(roomId, req.teamSlot(), Position.SUP, req.sup());
            savePositionStreamers(roomId, req.teamSlot(), Position.HEAD_COACH, req.headCoach());
            savePositionStreamers(roomId, req.teamSlot(), Position.COACH, req.coach());
        }

        List<String> coaches = requests.stream()
                .map(DraftRoomStreamerRequest::headCoach)
                .filter(info -> info != null && info.name() != null && !info.name().isBlank())
                .map(StreamerInfo::name)
                .toList();

        return SaveStreamerPoolResponse.builder()
                .availableCoaches(coaches)
                .build();
    }

    private void savePositionStreamers(Long roomId, int teamSlot, Position position, StreamerInfo info) {
        if (info == null || info.name() == null || info.name().isBlank()) return;

        DraftStreamer streamer = DraftStreamer.builder()
                .roomId(roomId)
                .teamSlot(teamSlot)
                .position(position)
                .streamerName(info.name())
                .imageUrl(info.imageUrl())
                .build();
        draftStreamerRepository.save(streamer);
    }

    @Transactional(readOnly = true)
    public DraftRoomStreamerResponse getDraftRoomStreamers(Long roomId) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));
        int teamCount = room.getTeamCount();

        List<DraftStreamer> streamers = draftStreamerRepository.findAllByRoomId(roomId);

        List<StreamerInfo> top = extractByPosition(streamers, Position.TOP, teamCount);
        List<StreamerInfo> jug = extractByPosition(streamers, Position.JUG, teamCount);
        List<StreamerInfo> mid = extractByPosition(streamers, Position.MID, teamCount);
        List<StreamerInfo> adc = extractByPosition(streamers, Position.ADC, teamCount);
        List<StreamerInfo> sup = extractByPosition(streamers, Position.SUP, teamCount);
        List<StreamerInfo> headCoach = extractByPosition(streamers, Position.HEAD_COACH, teamCount);
        List<StreamerInfo> coach = extractByPosition(streamers, Position.COACH, teamCount);

        return new DraftRoomStreamerResponse(top, jug, mid, adc, sup, headCoach, coach);
    }

    private List<StreamerInfo> extractByPosition(List<DraftStreamer> streamers, Position position, int teamCount) {
        List<StreamerInfo> result = new ArrayList<>(Collections.nCopies(teamCount, null));

        streamers.stream()
                .filter(s -> s.getPosition() == position)
                .forEach(s -> {
                    int slot = s.getTeamSlot();
                    if (slot > 0 && slot <= teamCount) {
                        result.set(slot, new StreamerInfo(s.getStreamerName(), s.getImageUrl()));
                    }
                });

        return result;
    }

    @Transactional(readOnly = true)
    public DraftPlayStateResponse getDraftPlayState(Long roomId) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        // 1. 참가자(감독) 정보 조회 및 정렬
        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(roomId);

        // 감독 선택을 완료한 참가자만 필터링 후 픽 순서(turnOrder)대로 정렬
        List<DraftParticipant> coaches = participants.stream()
                .filter(p -> p.getSelectedCoachName() != null)
                .sorted(Comparator.comparing(p -> p.getTurnOrder() != null ? p.getTurnOrder() : 999))
                .toList();

        // "pickOrder": ["감독A", "감독B"...] 배열 추출
        List<String> pickOrder = coaches.stream()
                .map(DraftParticipant::getSelectedCoachName)
                .toList();

        // "coaches": [...] 객체 배열 추출
        List<CoachResponse> coachResponses = coaches.stream()
                .map(p -> new CoachResponse(
                        p.getSelectedCoachName(),
                        p.getNickname()
                ))
                .toList();

        // 2. 스트리머 풀 조회 로직 재활용
        List<DraftStreamer> streamers = draftStreamerRepository.findAllByRoomId(roomId);
        int teamCount = room.getTeamCount();

        DraftConfigResponse.StreamersByLine streamersByLine = new DraftConfigResponse.StreamersByLine(
                extractByPosition(streamers, Position.TOP, teamCount),
                extractByPosition(streamers, Position.JUG, teamCount),
                extractByPosition(streamers, Position.MID, teamCount),
                extractByPosition(streamers, Position.ADC, teamCount),
                extractByPosition(streamers, Position.SUP, teamCount),
                extractByPosition(streamers, Position.HEAD_COACH, teamCount),
                extractByPosition(streamers, Position.COACH, teamCount)
        );

        // 3. 최종 데이터 조립
        DraftConfigResponse draftConfig = new DraftConfigResponse(pickOrder, coachResponses, streamersByLine);

        return new DraftPlayStateResponse(room.getId(), room.getStatus(), draftConfig);
    }

}

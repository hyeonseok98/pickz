package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.StreamerInfo;
import team.pickz.api.domain.draft.application.dto.request.DraftRoomStreamerRequest;
import team.pickz.api.domain.draft.application.dto.response.CoachResponse;
import team.pickz.api.domain.draft.application.dto.response.DraftConfigResponse;
import team.pickz.api.domain.draft.application.dto.response.DraftPlayStateResponse;
import team.pickz.api.domain.draft.application.dto.response.DraftRoomStreamerResponse;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.entity.DraftStreamer;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.draft.domain.repository.DraftStreamerRepository;
import team.pickz.api.domain.draft.domain.type.Position;

import java.util.Comparator;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DraftStreamerService {

    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final DraftStreamerRepository draftStreamerRepository;

    @Transactional
    public void saveDraftRoomStreamers(Long roomId, String participantToken, List<DraftRoomStreamerRequest> requests) {
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
            savePositionStreamers(roomId, req.teamSlot(), Position.COACH, req.coach());
        }
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
        List<DraftStreamer> streamers = draftStreamerRepository.findAllByRoomId(roomId);

        List<StreamerInfo> top = extractByPosition(streamers, Position.TOP);
        List<StreamerInfo> jungle = extractByPosition(streamers, Position.JUG);
        List<StreamerInfo> mid = extractByPosition(streamers, Position.MID);
        List<StreamerInfo> adc = extractByPosition(streamers, Position.ADC);
        List<StreamerInfo> support = extractByPosition(streamers, Position.SUP);
        List<StreamerInfo> coach = extractByPosition(streamers, Position.COACH);

        return new DraftRoomStreamerResponse(top, jungle, mid, adc, support, coach);
    }

    private List<StreamerInfo> extractByPosition(List<DraftStreamer> streamers, Position position) {
        return streamers.stream()
                .filter(s -> s.getPosition() == position)
                .sorted(Comparator.comparingInt(DraftStreamer::getTeamSlot))
                .map(s -> new StreamerInfo(s.getStreamerName(), s.getImageUrl()))
                .toList();
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

        DraftConfigResponse.StreamersByLine streamersByLine = new DraftConfigResponse.StreamersByLine(
                extractByPosition(streamers, Position.TOP),
                extractByPosition(streamers, Position.JUG),
                extractByPosition(streamers, Position.MID),
                extractByPosition(streamers, Position.ADC),
                extractByPosition(streamers, Position.SUP),
                extractByPosition(streamers, Position.COACH)
        );

        // 3. 최종 데이터 조립
        DraftConfigResponse draftConfig = new DraftConfigResponse(pickOrder, coachResponses, streamersByLine);

        return new DraftPlayStateResponse(room.getId(), room.getStatus(), draftConfig);
    }

}

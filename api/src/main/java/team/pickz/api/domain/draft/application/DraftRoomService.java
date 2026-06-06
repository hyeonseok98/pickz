package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.request.DraftRoomStreamerRequest;
import team.pickz.api.domain.draft.application.dto.request.RoomInitRequest;
import team.pickz.api.domain.draft.application.dto.response.*;
import team.pickz.api.domain.draft.application.event.DraftRoomStartedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantJoinedEvent;
import team.pickz.api.domain.draft.application.event.ParticipantUpdateEvent;
import team.pickz.api.domain.draft.application.event.RoomStatusEvent;
import team.pickz.api.domain.draft.application.util.RandomNicknameGenerator;
import team.pickz.api.domain.draft.application.util.RoomSequenceManager;
import team.pickz.api.domain.draft.domain.repository.DraftRoomStreamerRepository;
import team.pickz.api.domain.draft.domain.type.ParticipationType;
import team.pickz.api.domain.draft.domain.type.Position;
import team.pickz.api.domain.draft.domain.type.RoomStatus;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.entity.DraftRoom;
import team.pickz.api.domain.draft.domain.entity.DraftRoomStreamer;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;
import team.pickz.api.domain.draft.domain.repository.DraftRoomRepository;
import team.pickz.api.domain.member.domain.MemberRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class DraftRoomService {

    private final MemberRepository memberRepository;
    private final DraftRoomRepository draftRoomRepository;
    private final DraftParticipantRepository draftParticipantRepository;
    private final DraftRoomStreamerRepository draftRoomStreamerRepository;
    private final RoomSequenceManager roomSequenceManager;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public RoomInitResponse initRoom(/**Long hostMemberId,**/RoomInitRequest request) {
        //Member member = memberRepository.findByMemberId(hostMemberId);

        int teamCount = request.teamCount() != null ? request.teamCount() : 5;
        int teamSize = request.teamSize() != null ? request.teamSize() : 5;

        if ("2026_ZANATDAE".equals(request.preset())) {
            teamCount = 4;
            teamSize = 5;
        }

        DraftRoom room = DraftRoom.builder()
                .title(request.title())
                .draftMode(request.draftMode())
                .participationType(request.participationType())
                .preset(request.preset())
                .teamCount(teamCount)
                .teamSize(teamSize)
                .build();
        draftRoomRepository.save(room);

        DraftParticipant host = DraftParticipant.builder()
                .roomId(room.getId())
                //.memberId(member.getId())
                //.nickname(member.getNickname())
                .isHost(true)
                .build();
        draftParticipantRepository.save(host);

        return RoomInitResponse.builder()
                .roomId(room.getId())
                .inviteCode(room.getInviteCode())
                .participantToken(host.getParticipantToken())
                .isHost(true)
                .build();
    }

    @Transactional
    public void saveDraftRoomStreamers(Long roomId, String participantToken, List<DraftRoomStreamerRequest> requests) {
        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 스트리머 풀을 설정할 수 있습니다.");
        }

        draftRoomStreamerRepository.deleteAllByRoomId(roomId);

        for (DraftRoomStreamerRequest req : requests) {
            savePositionStreamers(roomId, req.teamSlot(), Position.TOP, req.top());
            savePositionStreamers(roomId, req.teamSlot(), Position.JUG, req.jug());
            savePositionStreamers(roomId, req.teamSlot(), Position.MID, req.mid());
            savePositionStreamers(roomId, req.teamSlot(), Position.ADC, req.adc());
            savePositionStreamers(roomId, req.teamSlot(), Position.SUP, req.sup());
            savePositionStreamers(roomId, req.teamSlot(), Position.COACH, req.coach());
        }
    }

    private void savePositionStreamers(Long roomId, int teamSlot, Position position, String name) {
        if(name == null || name.isBlank()) return;
        DraftRoomStreamer streamer = DraftRoomStreamer.builder()
                .roomId(roomId)
                .teamSlot(teamSlot)
                .position(position)
                .streamerName(name)
                .build();
        draftRoomStreamerRepository.save(streamer);
    }

    @Transactional(readOnly = true)
    public DraftRoomStreamerResponse getDraftRoomStreamers(Long roomId) {
        List<DraftRoomStreamer> streamers = draftRoomStreamerRepository.findAllByRoomId(roomId);

        List<String> top = extractByPosition(streamers, Position.TOP);
        List<String> jungle = extractByPosition(streamers, Position.JUG);
        List<String> mid = extractByPosition(streamers, Position.MID);
        List<String> adc = extractByPosition(streamers, Position.ADC);
        List<String> support = extractByPosition(streamers, Position.SUP);
        List<String> coach = extractByPosition(streamers, Position.COACH);

        return new DraftRoomStreamerResponse(top, jungle, mid, adc, support, coach);
    }

    private List<String> extractByPosition(List<DraftRoomStreamer> streamers, Position position) {
        return streamers.stream()
                .filter(s -> s.getPosition() == position)
                .sorted(Comparator.comparingInt(DraftRoomStreamer::getTeamSlot))
                .map(DraftRoomStreamer::getStreamerName)
                .toList();
    }

    @Transactional
    public ParticipantResponse joinRoom(String inviteCode) {
        DraftRoom room = draftRoomRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 코드입니다."));

        if(room.getStatus() != RoomStatus.WAITING) {
            throw new IllegalStateException("이미 게임이 시작된 방입니다.");
        }

        int sequence = roomSequenceManager.getNextSequence(room.getId());
        String nickname = RandomNicknameGenerator.generate(sequence);

        DraftParticipant participant = DraftParticipant.builder()
                .roomId(room.getId())
                .nickname(nickname)
                .isHost(false)
                .build();

        draftParticipantRepository.save(participant);

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(room.getId());
        List<String> nicknames = participants.stream()
                .map(DraftParticipant::getNickname)
                .toList();

        ParticipantUpdateEvent event = ParticipantUpdateEvent.builder()
                .totalCount(nicknames.size())
                .nicknames(nicknames)
                .newParticipant(nickname)
                .build();

        applicationEventPublisher.publishEvent(
                ParticipantJoinedEvent.builder()
                        .roomId(room.getId())
                        .payload(event)
                        .build()
        );

        return ParticipantResponse.builder()
                .roomId(room.getId())
                .participantToken(participant.getParticipantToken())
                .isHost(participant.isHost())
                .build();
    }

    @Transactional
    public void selectCoach(Long roomId, String participantToken, String coachName, int targetTurnOrder) {
        DraftParticipant participant = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        // 동시성 처리 고려: 이미 누군가 해당 감독/순서를 골랐는지 검증
        boolean isAlreadySelected = draftParticipantRepository.existsByRoomIdAndSelectedCoachName(roomId, coachName);
        if (isAlreadySelected) {
            throw new IllegalStateException("이미 다른 참가자가 선택한 감독입니다.");
        }

        participant.selectCoach(coachName, targetTurnOrder);

        // WebSocket 이벤트 발행 로직 (선택사항)
        // applicationEventPublisher.publishEvent(...);
    }

    @Transactional
    public void startDraft(Long roomId, String participantToken) {
        DraftRoom room = draftRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));

        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));

        if (!requestor.isHost()) {
            throw new IllegalArgumentException("방장만 드래프트를 시작할 수 있습니다.");
        }

        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(roomId);

        // 혼자하기 모드가 아닐 경우, 참가자들이 모두 감독 선택을 완료했는지 검증
        if (room.getParticipationType() == ParticipationType.TOGETHER) {
            long selectedCount = participants.stream().filter(p -> p.getSelectedCoachName() != null).count();
            if (selectedCount != room.getTeamCount()) {
                throw new IllegalStateException("모든 참가자가 감독(팀)을 선택해야 시작할 수 있습니다.");
            }
        }

        room.start();

        // 기존의 Collections.shuffle(participants)는 삭제합니다.
        // -> 참가자가 직접 감독을 선택하면서 픽 순서(turnOrder)가 결정되었기 때문입니다.

        RoomStatusEvent event = RoomStatusEvent.builder()
                .code("SUCCESS")
                .roomStatus(room.getStatus())
                .redirectUrl("/drafts/" + roomId + "/play")
                .build();

        applicationEventPublisher.publishEvent(
                DraftRoomStartedEvent.builder()
                        .roomId(roomId)
                        .payload(event)
                        .build()
        );
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
        List<DraftRoomStreamer> streamers = draftRoomStreamerRepository.findAllByRoomId(roomId);

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

    //    @Transactional
//    public void configureAndStartRoom(Long roomId, String participantToken, RoomConfigureRequest request) {
//        DraftRoom room = draftRoomRepository.findById(roomId)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다."));
//
//        DraftParticipant requestor = draftParticipantRepository.findByParticipantToken(participantToken)
//                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 참여자입니다."));
//
//        if (!requestor.isHost()) {
//            throw new IllegalArgumentException("방장만 드래프트를 시작할 수 있습니다.");
//        }
//
//        if(!requestor.getRoomId().equals(roomId)) {
//            throw new IllegalArgumentException("해당 방의 방장이 아닙니다.");
//        }
//
//        room.updateSettings(request.teamCount(), request.teamSize());
//
//        List<DraftParticipant> participants = draftParticipantRepository.findAllByRoomId(roomId);
//        if (participants.size() != room.getTeamCount()) {
//            throw new IllegalStateException("설정된 팀 개수만큼 참여자가 모여야 시작할 수 있습니다.");
//        }
//
//        room.start();
//
//        Collections.shuffle(participants);
//        for (int i = 0; i < participants.size(); i++) {
//            participants.get(i).assignTurnOrder(i);
//        }
//
//        RoomStatusEvent event = RoomStatusEvent.builder()
//                .code("SUCCESS")
//                .roomStatus(room.getStatus())
//                .redirectUrl("/drafts/" + roomId + "/play")
//                .build();
//
//        applicationEventPublisher.publishEvent(
//                DraftRoomStartedEvent.builder()
//                        .roomId(roomId)
//                        .payload(event)
//                        .build()
//        );
//    }

}

package team.pickz.api.domain.draft.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.pickz.api.domain.draft.application.dto.request.ChatMessageRequest;
import team.pickz.api.domain.draft.application.dto.response.ChatMessageResponse;
import team.pickz.api.domain.draft.application.event.DraftChatEvent;
import team.pickz.api.domain.draft.domain.type.MessageType;
import team.pickz.api.domain.draft.domain.entity.DraftParticipant;
import team.pickz.api.domain.draft.domain.repository.DraftParticipantRepository;

@RequiredArgsConstructor
@Service
public class DraftChatService {

    private final DraftParticipantRepository draftParticipantRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public void processChat(Long roomId, ChatMessageRequest request) {
        DraftParticipant sender = draftParticipantRepository.findByRoomIdAndParticipantToken(roomId, request.participantToken())
                .orElseThrow(() -> new IllegalArgumentException("채팅 권한이 없는 유효하지 않은 참여자입니다."));

        ChatMessageResponse response = ChatMessageResponse.of(
                sender.getNickname(),
                request.content(),
                MessageType.CHAT
        );

        eventPublisher.publishEvent(
                DraftChatEvent.builder()
                        .roomId(roomId)
                        .chatMessage(response)
                        .build()
        );
    }

}

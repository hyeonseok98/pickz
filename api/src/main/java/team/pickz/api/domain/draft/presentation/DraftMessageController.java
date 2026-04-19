package team.pickz.api.domain.draft.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import team.pickz.api.domain.draft.application.DraftPickService;
import team.pickz.api.domain.draft.application.DraftTimerService;
import team.pickz.api.domain.draft.application.dto.PickMessage;
import team.pickz.api.domain.draft.application.dto.PickResult;

@Controller
@RequiredArgsConstructor
public class DraftMessageController {

    private final DraftPickService draftPickService;
    private final DraftTimerService draftTimerService;
    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/draft.pick.{roomId}")
    public void handlePick(@DestinationVariable Long roomId, @Payload PickMessage message) {

        draftTimerService.cancelTimer(roomId);

        PickResult result = draftPickService.processPick(roomId, message.memberId(), message.streamerId());

        if (!result.isDraftDone()) {
            // TODO: nextTurnIndex를 통해 다음 유저의 memberId를 조회해와야 함
            Long nextExpectedMemberId = 0L; // 조회 로직 연동 필요
            draftTimerService.scheduleAutoPick(roomId, nextExpectedMemberId);
        }

        messagingTemplate.convertAndSend("/topic/draft/room/" + roomId, result);
    }

}

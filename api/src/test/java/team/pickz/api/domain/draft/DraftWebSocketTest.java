package team.pickz.api.domain.draft;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.JacksonJsonMessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import team.pickz.api.domain.draft.application.dto.request.PickMessageRequest; // 작성하신 패키지에 맞게 변경
import team.pickz.api.domain.draft.application.dto.response.PickResultResponse;   // 작성하신 패키지에 맞게 변경

import java.lang.reflect.Type;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DraftWebSocketTest {

    @LocalServerPort
    private int port;

    private WebSocketStompClient stompClient;

    @BeforeEach
    public void setup() {
        // 클라이언트 초기화 (기본 StandardWebSocketClient 사용)
        stompClient = new WebSocketStompClient(new StandardWebSocketClient());

        // 💡 Deprecated 되지 않은 최신 컨버터 사용
        stompClient.setMessageConverter(new JacksonJsonMessageConverter());
    }

    @Test
    void testPickStreamer() throws Exception {
        // 웹소켓 엔드포인트 URL (SecurityConfig 설정 등에 따라 달라질 수 있음)
        String url = "ws://localhost:" + port + "/api/ws-draft";

        // 1. 서버 연결 시도
        StompSession session = stompClient.connectAsync(url, new StompSessionHandlerAdapter() {}).get(1, TimeUnit.SECONDS);

        // 비동기 결과를 받을 CompletableFuture
        CompletableFuture<PickResultResponse> resultFuture = new CompletableFuture<>();

        // 2. 결과 채널(Topic) 구독
        // 프론트엔드가 결과를 받기 위해 리스닝하고 있는 경로
        session.subscribe("/topic/draft/room/1", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                // 메시지를 변환할 대상 클래스 타입 지정
                return PickResultResponse.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                // 서버로부터 메시지를 받으면 Future를 완료시킴
                resultFuture.complete((PickResultResponse) payload);
            }
        });

        // 3. 서버로 픽 메시지 발행(Send)
        // memberId 대신 participantToken을 사용하는 방식 적용
        PickMessageRequest message = new PickMessageRequest("test-participant-token-123", "dkfhoihewoid1235");
        session.send("/app/draft/room/1/pick", message);

        // 4. 서버 응답 검증 (최대 3초 대기)
        PickResultResponse result = resultFuture.get(3, TimeUnit.SECONDS);

        // Assertions
        assertThat(result).isNotNull();
        assertThat(result.pickedStreamerId()).isEqualTo("dkfhoihewoid1235");
        // 필요에 따라 다음 턴 닉네임, 완료 여부 등을 추가 검증합니다.
    }
}

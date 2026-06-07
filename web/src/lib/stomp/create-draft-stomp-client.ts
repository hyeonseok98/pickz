import { Client, type IFrame } from "@stomp/stompjs";

interface CreateDraftStompClientParams {
  onConnect?: (frame: IFrame) => void;
  onDisconnect?: (frame: IFrame) => void;
  onStompError?: (frame: IFrame) => void;
  onWebSocketError?: (event: Event) => void;
}

function normalizeWebSocketUrl(rawValue: string) {
  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    return "";
  }

  if (trimmedValue.startsWith("ws://") || trimmedValue.startsWith("wss://")) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith("http://")) {
    return `ws://${trimmedValue.slice("http://".length)}`;
  }

  if (trimmedValue.startsWith("https://")) {
    return `wss://${trimmedValue.slice("https://".length)}`;
  }

  return trimmedValue;
}

function getDraftStompBrokerUrl() {
  const brokerUrl = normalizeWebSocketUrl(process.env.NEXT_PUBLIC_DRAFT_WS_URL ?? "");

  if (brokerUrl.length === 0) {
    throw new Error("NEXT_PUBLIC_DRAFT_WS_URL 환경 변수가 없습니다.");
  }

  return brokerUrl;
}

export function createDraftStompClient({
  onConnect,
  onDisconnect,
  onStompError,
  onWebSocketError,
}: CreateDraftStompClientParams = {}) {
  return new Client({
    brokerURL: getDraftStompBrokerUrl(),
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    reconnectDelay: 5000,
    // 현재 STOMP 연결 테스트는 인증 헤더 없이 진행함.
    onConnect,
    onDisconnect,
    onStompError,
    onWebSocketError,
  });
}

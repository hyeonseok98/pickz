"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createDraftStompClient } from "@/libs/stomp";
import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";

type DraftRoomStompConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseDraftRoomStompParams {
  roomId: number;
  participantToken: string;
  onChatMessage?: (messageBody: string) => void;
  onConnectionError?: (messageBody: string) => void;
  onRoomMessage?: (messageBody: string) => void;
  onErrorMessage?: (messageBody: string) => void;
}

interface UseDraftRoomStompReturn {
  connectionStatus: DraftRoomStompConnectionStatus;
  publishChat: (content: string) => void;
  publishPick: (streamerId: string) => void;
}

export function useDraftRoomStomp({
  roomId,
  participantToken,
  onChatMessage,
  onConnectionError,
  onErrorMessage,
  onRoomMessage,
}: UseDraftRoomStompParams): UseDraftRoomStompReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<DraftRoomStompConnectionStatus>("idle");
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);
  const onRoomMessageRef = useRef(onRoomMessage);
  const onErrorMessageRef = useRef(onErrorMessage);
  const onChatMessageRef = useRef(onChatMessage);
  const onConnectionErrorRef = useRef(onConnectionError);

  useEffect(() => {
    onRoomMessageRef.current = onRoomMessage;
  }, [onRoomMessage]);

  useEffect(() => {
    onErrorMessageRef.current = onErrorMessage;
  }, [onErrorMessage]);

  useEffect(() => {
    onChatMessageRef.current = onChatMessage;
  }, [onChatMessage]);

  useEffect(() => {
    onConnectionErrorRef.current = onConnectionError;
  }, [onConnectionError]);

  useEffect(() => {
    if (roomId <= 0 || participantToken.trim().length === 0) {
      return undefined;
    }

    let isCleanedUp = false;

    const unsubscribeAll = () => {
      // 재연결 또는 페이지 이탈 시 중복 구독이 남지 않게 정리함.
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current = [];
    };

    try {
      const client = createDraftStompClient({
        onConnect: () => {
          if (isCleanedUp) {
            return;
          }

          unsubscribeAll();

          const roomSubscription = client.subscribe(
            `/topic/drafts/rooms/${roomId}`,
            (message: IMessage) => {
              console.log("[draft room message]", message.body);
              onRoomMessageRef.current?.(message.body);
            },
          );
          const errorSubscription = client.subscribe(
            "/user/queue/errors",
            (message: IMessage) => {
              console.warn("[draft room error]", message.body);
              onErrorMessageRef.current?.(message.body);
            },
          );
          const chatSubscription = client.subscribe(
            `/topic/drafts/rooms/${roomId}/chat`,
            (message: IMessage) => {
              console.log("[draft room chat]", message.body);
              onChatMessageRef.current?.(message.body);
            },
          );

          subscriptionsRef.current = [roomSubscription, errorSubscription, chatSubscription];
          setConnectionStatus("connected");
        },
        onDisconnect: () => {
          if (!isCleanedUp) {
            setConnectionStatus("disconnected");
          }
        },
        onStompError: (frame) => {
          const errorMessage = frame.body || frame.headers.message || "STOMP error";
          console.warn("[draft stomp error]", errorMessage);

          if (!isCleanedUp) {
            setConnectionStatus("error");
            onConnectionErrorRef.current?.(errorMessage);
          }
        },
        onWebSocketError: (event) => {
          console.warn("[draft websocket error]", event);

          if (!isCleanedUp) {
            setConnectionStatus("error");
            onConnectionErrorRef.current?.(
              "WebSocket 연결에 실패했습니다. NEXT_PUBLIC_DRAFT_WS_URL과 백엔드 WebSocket 배포 설정을 확인하세요.",
            );
          }
        },
      });

      clientRef.current = client;
      queueMicrotask(() => {
        if (!isCleanedUp) {
          setConnectionStatus("connecting");
        }
      });
      client.activate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "STOMP setup error";
      console.warn("[draft stomp setup error]", errorMessage);
      queueMicrotask(() => {
        if (!isCleanedUp) {
          setConnectionStatus("error");
          onConnectionErrorRef.current?.(errorMessage);
        }
      });
    }

    return () => {
      isCleanedUp = true;
      unsubscribeAll();

      const currentClient = clientRef.current;
      clientRef.current = null;

      if (currentClient) {
        void currentClient.deactivate();
      }
    };
  }, [participantToken, roomId]);

  const publishPick = useCallback(
    (streamerId: string) => {
      const client = clientRef.current;
      const normalizedStreamerId = streamerId.trim();

      if (!client?.connected || normalizedStreamerId.length === 0) {
        return;
      }

      client.publish({
        destination: `/app/drafts/rooms/${roomId}`,
        body: JSON.stringify({
          participantToken,
          streamerId: normalizedStreamerId,
        }),
      });
    },
    [participantToken, roomId],
  );

  const publishChat = useCallback(
    (content: string) => {
      const client = clientRef.current;
      const normalizedContent = content.trim();

      if (!client?.connected || normalizedContent.length === 0) {
        return;
      }

      client.publish({
        destination: `/app/drafts/rooms/${roomId}/chat`,
        body: JSON.stringify({
          participantToken,
          content: normalizedContent,
        }),
      });
    },
    [participantToken, roomId],
  );

  return {
    connectionStatus,
    publishChat,
    publishPick,
  };
}

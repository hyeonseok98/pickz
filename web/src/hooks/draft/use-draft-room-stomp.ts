"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createDraftRoomStompConnectHeaders, createDraftStompClient } from "@/lib";
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
  onParticipantsMessage?: (messageBody: string) => void;
  onRoomDeletedMessage?: (messageBody: string) => void;
  onErrorMessage?: (messageBody: string) => void;
}

interface UseDraftRoomStompReturn {
  connectionStatus: DraftRoomStompConnectionStatus;
  disconnect: () => void;
  publishChat: (content: string) => void;
  publishPick: (streamerId: string) => void;
}

function parseStompMessageBody(messageBody: string) {
  try {
    return JSON.parse(messageBody) as unknown;
  } catch {
    return messageBody;
  }
}

function logDraftStompEvent(
  eventName: string,
  payload: Record<string, unknown>,
  logType: "log" | "warn" = "log",
) {
  const logger = logType === "warn" ? console.warn : console.log;

  logger(`[draft stomp] ${eventName}`, {
    occurredAt: new Date().toISOString(),
    ...payload,
  });
}

export function useDraftRoomStomp({
  roomId,
  participantToken,
  onChatMessage,
  onConnectionError,
  onErrorMessage,
  onParticipantsMessage,
  onRoomDeletedMessage,
  onRoomMessage,
}: UseDraftRoomStompParams): UseDraftRoomStompReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<DraftRoomStompConnectionStatus>("idle");
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);
  const onRoomMessageRef = useRef(onRoomMessage);
  const onParticipantsMessageRef = useRef(onParticipantsMessage);
  const onRoomDeletedMessageRef = useRef(onRoomDeletedMessage);
  const onErrorMessageRef = useRef(onErrorMessage);
  const onChatMessageRef = useRef(onChatMessage);
  const onConnectionErrorRef = useRef(onConnectionError);

  useEffect(() => {
    onRoomMessageRef.current = onRoomMessage;
  }, [onRoomMessage]);

  useEffect(() => {
    onParticipantsMessageRef.current = onParticipantsMessage;
  }, [onParticipantsMessage]);

  useEffect(() => {
    onRoomDeletedMessageRef.current = onRoomDeletedMessage;
  }, [onRoomDeletedMessage]);

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

    const disconnectClient = () => {
      logDraftStompEvent("disconnect requested", {
        roomId,
      });
      unsubscribeAll();

      const currentClient = clientRef.current;
      clientRef.current = null;

      if (currentClient) {
        void currentClient.deactivate();
      }
    };

    try {
      const connectHeaders = createDraftRoomStompConnectHeaders({
        participantToken,
        roomId,
      });
      const client = createDraftStompClient({
        connectHeaders,
        onConnect: (frame) => {
          if (isCleanedUp) {
            return;
          }

          logDraftStompEvent("connected", {
            connectHeaders,
            frameHeaders: frame.headers,
            roomId,
          });
          unsubscribeAll();

          const roomSubscription = client.subscribe(
            `/topic/drafts/rooms/${roomId}`,
            (message: IMessage) => {
              logDraftStompEvent("message received", {
                body: parseStompMessageBody(message.body),
                destination: `/topic/drafts/rooms/${roomId}`,
                headers: message.headers,
                rawBody: message.body,
                roomId,
              });
              onRoomMessageRef.current?.(message.body);
            },
          );
          const participantsSubscription = client.subscribe(
            `/topic/drafts/rooms/${roomId}/participants`,
            (message: IMessage) => {
              logDraftStompEvent("message received", {
                body: parseStompMessageBody(message.body),
                destination: `/topic/drafts/rooms/${roomId}/participants`,
                headers: message.headers,
                rawBody: message.body,
                roomId,
              });
              onParticipantsMessageRef.current?.(message.body);
            },
          );
          const deletedSubscription = client.subscribe(
            `/topic/drafts/rooms/${roomId}/deleted`,
            (message: IMessage) => {
              logDraftStompEvent("message received", {
                body: parseStompMessageBody(message.body),
                destination: `/topic/drafts/rooms/${roomId}/deleted`,
                headers: message.headers,
                rawBody: message.body,
                roomId,
              });
              onRoomDeletedMessageRef.current?.(message.body);
              disconnectClient();
            },
          );
          const errorSubscription = client.subscribe(
            "/user/queue/errors",
            (message: IMessage) => {
              logDraftStompEvent(
                "message received",
                {
                  body: parseStompMessageBody(message.body),
                  destination: "/user/queue/errors",
                  headers: message.headers,
                  rawBody: message.body,
                  roomId,
                },
                "warn",
              );
              onErrorMessageRef.current?.(message.body);
            },
          );
          const chatSubscription = client.subscribe(
            `/topic/drafts/rooms/${roomId}/chat`,
            (message: IMessage) => {
              logDraftStompEvent("message received", {
                body: parseStompMessageBody(message.body),
                destination: `/topic/drafts/rooms/${roomId}/chat`,
                headers: message.headers,
                rawBody: message.body,
                roomId,
              });
              onChatMessageRef.current?.(message.body);
            },
          );

          subscriptionsRef.current = [
            roomSubscription,
            participantsSubscription,
            deletedSubscription,
            errorSubscription,
            chatSubscription,
          ];
          logDraftStompEvent("subscriptions ready", {
            destinations: [
              `/topic/drafts/rooms/${roomId}`,
              `/topic/drafts/rooms/${roomId}/participants`,
              `/topic/drafts/rooms/${roomId}/deleted`,
              "/user/queue/errors",
              `/topic/drafts/rooms/${roomId}/chat`,
            ],
            roomId,
          });
          setConnectionStatus("connected");
        },
        onDisconnect: (frame) => {
          logDraftStompEvent("disconnected", {
            frameHeaders: frame.headers,
            roomId,
          });
          if (!isCleanedUp) {
            setConnectionStatus("disconnected");
          }
        },
        onStompError: (frame) => {
          const errorMessage = frame.body || frame.headers.message || "STOMP error";
          logDraftStompEvent(
            "stomp error",
            {
              body: frame.body,
              frameHeaders: frame.headers,
              message: errorMessage,
              roomId,
            },
            "warn",
          );

          if (!isCleanedUp) {
            setConnectionStatus("error");
            onConnectionErrorRef.current?.(errorMessage);
          }
        },
        onWebSocketError: (event) => {
          logDraftStompEvent(
            "websocket error",
            {
              event,
              roomId,
            },
            "warn",
          );

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
          logDraftStompEvent("connecting", {
            connectHeaders,
            roomId,
          });
          setConnectionStatus("connecting");
        }
      });
      client.activate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "STOMP setup error";
      logDraftStompEvent(
        "setup error",
        {
          message: errorMessage,
          roomId,
        },
        "warn",
      );
      queueMicrotask(() => {
        if (!isCleanedUp) {
          setConnectionStatus("error");
          onConnectionErrorRef.current?.(errorMessage);
        }
      });
    }

    return () => {
      isCleanedUp = true;
      disconnectClient();
    };
  }, [participantToken, roomId]);

  const disconnect = useCallback(() => {
    logDraftStompEvent("manual disconnect", {
      roomId,
    });
    subscriptionsRef.current.forEach((subscription) => {
      subscription.unsubscribe();
    });
    subscriptionsRef.current = [];

    const currentClient = clientRef.current;
    clientRef.current = null;

    if (currentClient) {
      void currentClient.deactivate();
    }
  }, [roomId]);

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
      logDraftStompEvent("publish", {
        body: {
          participantToken,
          streamerId: normalizedStreamerId,
        },
        destination: `/app/drafts/rooms/${roomId}`,
        roomId,
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
      logDraftStompEvent("publish", {
        body: {
          participantToken,
          content: normalizedContent,
        },
        destination: `/app/drafts/rooms/${roomId}/chat`,
        roomId,
      });
    },
    [participantToken, roomId],
  );

  return {
    connectionStatus,
    disconnect,
    publishChat,
    publishPick,
  };
}

"use client";

import { useMutation } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createDraftRoom, joinDraftRoomByInviteCode, startDraftRoom } from "@/apis/drafts";
import { useDraftRoomStomp } from "@/hooks/drafts";
import type { DraftParticipantSession, JoinDraftRoomResponse } from "@/types/drafts";
import {
  cn,
  getDraftParticipantSession,
  removeDraftParticipantSession,
  saveDraftParticipantSession,
} from "@/utils";

const fixedTeamCount = 5;
const fixedTeamSize = 5;

type ChatPublisher = (content: string) => void;
type DraftConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface ReceivedMessage {
  body: string;
  id: string;
  receivedAt: string;
}

interface SharedChatMessage {
  content: string;
  id: string;
  nickname: string;
  rawBody: string;
  receivedAt: string;
  receivedFromLabels: string[];
  senderLabel: string;
  senderRole: TestParticipantSession["role"] | null;
  timestamp: string;
  type: string;
}

interface TestParticipantSession extends DraftParticipantSession {
  label: string;
  role: "host" | "participant";
}

interface ChatSenderMetadata {
  label: string;
  role: TestParticipantSession["role"];
}

interface DraftRoomParticipantEventPayload {
  newParticipant?: string;
  nicknames?: Array<string | null>;
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M15 10H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m9 5-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <rect x="7" y="4" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 7.5V6a2 2 0 0 1 2-2h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 8.5V14a2 2 0 0 0 2 2h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M17 3 8.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M17 3 12.5 17 8.5 11.5 3 8 17 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatusChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "error" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : tone === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-border bg-surface-muted text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex h-14 w-28 flex-col justify-center rounded-xl border border-border bg-surface-muted px-3">
      <p className="text-[11px] font-semibold text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

function ParticipantInfoCard({ session }: { session: TestParticipantSession }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-text-primary">{session.label}</h3>
        <StatusChip>{session.label}</StatusChip>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold text-text-muted">token</p>
        <p className="mt-1 break-all text-sm font-semibold text-text-primary">
          {session.participantToken}
        </p>
      </div>
    </article>
  );
}

function MessageList({
  emptyText,
  messages,
  title,
}: {
  emptyText: string;
  messages: ReceivedMessage[];
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-slate-950 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <StatusChip>{messages.length}개</StatusChip>
      </div>

      <div className="mt-3 max-h-56 space-y-3 overflow-auto">
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-slate-800 px-4 py-8 text-center text-sm text-slate-400">
            {emptyText}
          </p>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-slate-800 px-3 py-3">
              <p className="text-xs font-semibold text-slate-500">{message.receivedAt}</p>
              <pre className="mt-2 whitespace-pre-wrap break-all text-xs leading-5 text-slate-100">
                {message.body}
              </pre>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function createInviteLink(inviteCode: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");

  return appUrl ? `${appUrl}/join/${inviteCode}` : `/join/${inviteCode}`;
}

function getDisplayNickname(nickname: string | undefined, fallbackLabel: string) {
  const normalizedNickname = nickname?.trim();

  if (!normalizedNickname || normalizedNickname === "null") {
    return fallbackLabel;
  }

  return normalizedNickname;
}

function createReceivedMessage(body: string): ReceivedMessage {
  return {
    body,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    receivedAt: new Date().toLocaleTimeString("ko-KR", { hour12: false }),
  };
}

function parseChatMessage(rawBody: string) {
  try {
    const parsedValue = JSON.parse(rawBody) as Record<string, unknown>;
    const nickname =
      typeof parsedValue.nickname === "string" &&
      parsedValue.nickname.trim().length > 0 &&
      parsedValue.nickname !== "null"
        ? parsedValue.nickname
        : "";

    return {
      content: typeof parsedValue.content === "string" ? parsedValue.content : rawBody,
      nickname,
      timestamp: typeof parsedValue.timestamp === "string" ? parsedValue.timestamp : "",
      type: typeof parsedValue.type === "string" ? parsedValue.type : "",
    };
  } catch {
    return {
      content: rawBody,
      nickname: "",
      timestamp: "",
      type: "",
    };
  }
}

function parseDraftRoomParticipantEvent(rawBody: string): DraftRoomParticipantEventPayload | null {
  try {
    const parsedValue = JSON.parse(rawBody) as Record<string, unknown>;
    const eventPayload =
      parsedValue.payload && typeof parsedValue.payload === "object"
        ? (parsedValue.payload as Record<string, unknown>)
        : parsedValue;
    const rawNicknames = Array.isArray(eventPayload.nicknames) ? eventPayload.nicknames : null;
    const nicknames = rawNicknames?.map((nickname) => {
      if (typeof nickname !== "string") {
        return null;
      }

      const trimmedNickname = nickname.trim();

      return trimmedNickname.length > 0 && trimmedNickname !== "null" ? trimmedNickname : null;
    });
    const newParticipant =
      typeof eventPayload.newParticipant === "string" && eventPayload.newParticipant.trim().length > 0
        ? eventPayload.newParticipant.trim()
        : undefined;

    if (!nicknames && !newParticipant) {
      return null;
    }

    return {
      newParticipant,
      nicknames: nicknames ?? undefined,
    };
  } catch {
    return null;
  }
}

function createSharedChatMessage(
  sourceLabel: string,
  rawBody: string,
  fallbackSender: ChatSenderMetadata | null = null,
): SharedChatMessage {
  const parsedMessage = parseChatMessage(rawBody);
  const nickname = parsedMessage.nickname || fallbackSender?.label || "";
  const senderRole = fallbackSender?.role ?? (nickname === "방장" ? "host" : null);

  return {
    ...parsedMessage,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nickname,
    rawBody,
    receivedAt: new Date().toLocaleTimeString("ko-KR", { hour12: false }),
    receivedFromLabels: [sourceLabel],
    senderLabel: fallbackSender?.label ?? nickname,
    senderRole,
  };
}

function SharedChatPanel({
  activeParticipantToken,
  activeSessionStatus,
  canPublishChat,
  chatContent,
  messages,
  onActiveParticipantTokenChange,
  onChatContentChange,
  onPublishChat,
  sessions,
}: {
  activeParticipantToken: string;
  activeSessionStatus: DraftConnectionStatus;
  canPublishChat: boolean;
  chatContent: string;
  messages: SharedChatMessage[];
  onActiveParticipantTokenChange: (participantToken: string) => void;
  onChatContentChange: (content: string) => void;
  onPublishChat: () => void;
  sessions: TestParticipantSession[];
}) {
  const activeSession = sessions.find((session) => session.participantToken === activeParticipantToken) ?? null;
  const orderedMessages = [...messages].reverse();

  return (
    <SectionCard
      title="통합 채팅"
      description="전체 채팅을 한 대화창에서 보고, 아래 탭으로 발신자를 바꿔 바로 메시지를 보냅니다."
    >
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="px-5 pt-4">
            <p className="text-sm font-bold text-text-primary">전체 채팅창</p>
            <p className="mt-1 text-xs font-semibold text-text-muted">
              {activeSession ? `${activeSession.label}로 입력 중` : "방 생성 후 채팅 가능"}
            </p>
          </div>
          <div className="px-5 pt-4">
            <StatusChip>{messages.length}개</StatusChip>
          </div>
        </div>

        <div className="mt-4 flex h-[420px] flex-col gap-4 overflow-auto bg-surface-muted px-5 py-5">
          {messages.length === 0 ? (
            <div className="m-auto rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
              <p className="text-sm font-semibold text-text-primary">아직 채팅이 없습니다.</p>
              <p className="mt-1 text-xs text-text-muted">아래 탭에서 발신자를 고르고 메시지를 보내세요.</p>
            </div>
          ) : (
            orderedMessages.map((message) => {
              const isHostMessage = message.senderRole === "host" || message.nickname === "방장";

              return (
                <article
                  key={message.id}
                  className={cn("flex flex-col gap-1.5", isHostMessage ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "flex max-w-[82%] flex-col",
                      isHostMessage ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-wrap items-center gap-2 px-1",
                        isHostMessage ? "justify-end" : "justify-start",
                      )}
                    >
                      <span className="text-xs font-bold text-text-primary">
                        {message.nickname || message.senderLabel || "보낸 사람 미확인"}
                      </span>
                      <span className="text-[11px] font-semibold text-text-muted">
                        {message.timestamp || message.receivedAt}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "mt-1 rounded-2xl border px-4 py-3 shadow-sm",
                        isHostMessage
                          ? "rounded-tr-md border-slate-950 bg-slate-950 text-white"
                          : "rounded-tl-md border-border bg-surface text-text-primary",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6">
                        {message.content}
                      </p>
                    </div>
                    <p className="mt-1 px-1 text-[11px] font-semibold text-text-muted">
                      수신: {message.receivedFromLabels.join(", ")}
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="border-t border-border bg-surface px-4 py-4">
          <div className="flex flex-wrap gap-2">
          {sessions.length === 0 ? (
            <StatusChip>방 생성 후 발신자 탭이 표시됩니다.</StatusChip>
          ) : (
            sessions.map((session) => {
              const isActive = session.participantToken === activeParticipantToken;

              return (
                <button
                  key={session.participantToken}
                  type="button"
                  onClick={() => {
                    onActiveParticipantTokenChange(session.participantToken);
                  }}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3 text-xs font-bold transition-colors",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-border bg-surface text-text-secondary hover:text-text-primary",
                  )}
                >
                  {session.label}
                </button>
              );
            })
          )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip>발신자: {activeSession?.label ?? "없음"}</StatusChip>
            <StatusChip tone={activeSessionStatus === "connected" ? "success" : "warning"}>
              연결 상태: {activeSessionStatus}
            </StatusChip>
            {activeSession?.role === "host" ? <StatusChip>방장</StatusChip> : null}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={chatContent}
              onChange={(event) => {
                onChatContentChange(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canPublishChat) {
                  onPublishChat();
                }
              }}
              placeholder={activeSession ? `${activeSession.label} 메시지 입력` : "방 생성 후 채팅 가능"}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-surface-muted px-4 text-sm text-text-primary outline-none transition focus:border-violet-300"
            />
            <button
              type="button"
              disabled={!canPublishChat}
              onClick={onPublishChat}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="채팅 보내기"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function DraftRoomRealtimeTester({
  onRoomEvent,
  onRegisterChatPublisher,
  onSharedChatMessage,
  onUnregisterChatPublisher,
  session,
}: {
  onRoomEvent: (messageBody: string) => void;
  onRegisterChatPublisher: (
    session: TestParticipantSession,
    publisher: ChatPublisher,
    status: DraftConnectionStatus,
  ) => void;
  onSharedChatMessage: (sourceLabel: string, messageBody: string) => void;
  onUnregisterChatPublisher: (participantToken: string) => void;
  session: TestParticipantSession;
}) {
  const [roomMessages, setRoomMessages] = useState<ReceivedMessage[]>([]);
  const [errorMessages, setErrorMessages] = useState<ReceivedMessage[]>([]);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState("");

  const handleRoomMessage = useCallback((messageBody: string) => {
    setRoomMessages((currentMessages) => [createReceivedMessage(messageBody), ...currentMessages].slice(0, 30));
    onRoomEvent(messageBody);
  }, [onRoomEvent]);

  const handleChatMessage = useCallback(
    (messageBody: string) => {
      onSharedChatMessage(session.label, messageBody);
    },
    [onSharedChatMessage, session.label],
  );

  const handleErrorMessage = useCallback((messageBody: string) => {
    setErrorMessages((currentMessages) => [createReceivedMessage(messageBody), ...currentMessages].slice(0, 30));
  }, []);

  const { connectionStatus, publishChat } = useDraftRoomStomp({
    roomId: session.roomId,
    participantToken: session.participantToken,
    onChatMessage: handleChatMessage,
    onConnectionError: setConnectionErrorMessage,
    onRoomMessage: handleRoomMessage,
    onErrorMessage: handleErrorMessage,
  });

  useEffect(() => {
    onRegisterChatPublisher(session, publishChat, connectionStatus);

    return () => {
      onUnregisterChatPublisher(session.participantToken);
    };
  }, [connectionStatus, onRegisterChatPublisher, onUnregisterChatPublisher, publishChat, session]);

  const connectionTone = useMemo(() => {
    if (connectionStatus === "connected") {
      return "success";
    }

    if (connectionStatus === "error") {
      return "error";
    }

    if (connectionStatus === "connecting") {
      return "warning";
    }

    return "default";
  }, [connectionStatus]);

  return (
    <SectionCard
      title={`${session.label} 실시간 연결`}
      description="방 이벤트와 개인 에러를 확인합니다. 채팅 발신은 통합 채팅창 아래 탭에서 처리합니다."
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone={connectionTone}>connectionStatus: {connectionStatus}</StatusChip>
        <StatusChip>{session.role === "host" ? "방장" : "참가자"}</StatusChip>
        <StatusChip>room topic: /topic/drafts/rooms/{session.roomId}</StatusChip>
        <StatusChip>chat: /topic/drafts/rooms/{session.roomId}/chat</StatusChip>
        <StatusChip>error: /user/queue/errors</StatusChip>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <DetailRow label="WebSocket URL" value={process.env.NEXT_PUBLIC_DRAFT_WS_URL ?? "미설정"} />
        <DetailRow label="Chat Publish Destination" value={`/app/drafts/rooms/${session.roomId}/chat`} />
      </div>

      {connectionErrorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {connectionErrorMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <MessageList
          title="방 이벤트"
          emptyText="아직 방 이벤트 메시지가 없습니다."
          messages={roomMessages}
        />
        <MessageList
          title="개인 에러"
          emptyText="아직 개인 에러 메시지가 없습니다."
          messages={errorMessages}
        />
      </div>
    </SectionCard>
  );
}

export default function DraftWebSocketTestPage() {
  const chatPublishersRef = useRef(new Map<string, ChatPublisher>());
  const pendingChatSenderByContentRef = useRef(new Map<string, ChatSenderMetadata>());
  const [hostSession, setHostSession] = useState<TestParticipantSession | null>(null);
  const [participantSessions, setParticipantSessions] = useState<TestParticipantSession[]>([]);
  const [connectionStatusByParticipantToken, setConnectionStatusByParticipantToken] = useState<
    Record<string, DraftConnectionStatus>
  >({});
  const [activeChatParticipantToken, setActiveChatParticipantToken] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [sharedChatMessages, setSharedChatMessages] = useState<SharedChatMessage[]>([]);
  const [isParticipantSessionSaved, setIsParticipantSessionSaved] = useState(false);
  const [inviteLinkCopyStatus, setInviteLinkCopyStatus] = useState("");

  const allSessions = useMemo(
    () => (hostSession ? [hostSession, ...participantSessions] : []),
    [hostSession, participantSessions],
  );
  const totalParticipantCount = allSessions.length;
  const requiredGuestCount = hostSession ? fixedTeamCount - 1 : 0;
  const remainingGuestCount = Math.max(requiredGuestCount - participantSessions.length, 0);
  const canJoinParticipant = Boolean(hostSession) && remainingGuestCount > 0;
  const canStartRoom = Boolean(hostSession) && totalParticipantCount === fixedTeamCount;
  const participantCountTone =
    totalParticipantCount === fixedTeamCount
      ? "success"
      : totalParticipantCount > fixedTeamCount
        ? "error"
        : "warning";
  const effectiveActiveChatParticipantToken = allSessions.some(
    (session) => session.participantToken === activeChatParticipantToken,
  )
    ? activeChatParticipantToken
    : (allSessions[0]?.participantToken ?? "");
  const activeChatSession =
    allSessions.find((session) => session.participantToken === effectiveActiveChatParticipantToken) ?? null;
  const activeSessionStatus = activeChatSession
    ? connectionStatusByParticipantToken[activeChatSession.participantToken] ?? "idle"
    : "idle";
  const canPublishChat =
    Boolean(activeChatSession) &&
    activeSessionStatus === "connected" &&
    chatContent.trim().length > 0;

  const handleRegisterChatPublisher = useCallback(
    (session: TestParticipantSession, publisher: ChatPublisher, status: DraftConnectionStatus) => {
      chatPublishersRef.current.set(session.participantToken, publisher);
      setConnectionStatusByParticipantToken((currentStatuses) => {
        if (currentStatuses[session.participantToken] === status) {
          return currentStatuses;
        }

        return {
          ...currentStatuses,
          [session.participantToken]: status,
        };
      });
    },
    [],
  );
  const handleUnregisterChatPublisher = useCallback((participantToken: string) => {
    chatPublishersRef.current.delete(participantToken);
    setConnectionStatusByParticipantToken((currentStatuses) => {
      const nextStatuses = { ...currentStatuses };
      delete nextStatuses[participantToken];

      return nextStatuses;
    });
  }, []);
  const appendParticipantSessions = useCallback(
    (responses: JoinDraftRoomResponse[]) => {
      if (!hostSession) {
        return;
      }

      setParticipantSessions((currentSessions) => {
        const nextSessions = [...currentSessions];

        responses.forEach((response) => {
          const participantNumber = nextSessions.length + 1;

          nextSessions.push({
            isHost: response.isHost,
            roomId: hostSession.roomId,
            inviteCode: hostSession.inviteCode,
            nickname: getDisplayNickname(response.nickname, `참가자 ${participantNumber}`),
            participantToken: response.participantToken,
            label: `참가자 ${participantNumber}`,
            role: "participant",
          });
        });

        return nextSessions.slice(0, requiredGuestCount);
      });
    },
    [hostSession, requiredGuestCount],
  );
  const applyParticipantNicknamesFromRoomEvent = useCallback((messageBody: string) => {
    const participantEvent = parseDraftRoomParticipantEvent(messageBody);

    if (!participantEvent) {
      return;
    }

    setParticipantSessions((currentSessions) => {
      if (currentSessions.length === 0) {
        return currentSessions;
      }

      let isChanged = false;
      const normalizedNicknames = participantEvent.nicknames ?? [];
      const shouldSkipFirstNickname =
        normalizedNicknames.length >= currentSessions.length + 1 && normalizedNicknames[0] === null;
      const nicknameStartIndex = shouldSkipFirstNickname ? 1 : 0;
      const nextSessions = currentSessions.map((session, index) => {
        const candidateNickname =
          normalizedNicknames[nicknameStartIndex + index] ?? (index === currentSessions.length - 1 ? participantEvent.newParticipant : null);

        if (!candidateNickname || candidateNickname === session.nickname) {
          return session;
        }

        isChanged = true;

        return {
          ...session,
          nickname: candidateNickname,
        };
      });

      return isChanged ? nextSessions : currentSessions;
    });
  }, []);
  const appendSharedChatMessage = useCallback((sourceLabel: string, messageBody: string) => {
    setSharedChatMessages((currentMessages) => {
      const matchedMessage = currentMessages.find((message) => message.rawBody === messageBody);

      if (matchedMessage) {
        return currentMessages.map((message) => {
          if (message.id !== matchedMessage.id || message.receivedFromLabels.includes(sourceLabel)) {
            return message;
          }

          return {
            ...message,
            receivedFromLabels: [...message.receivedFromLabels, sourceLabel],
          };
        });
      }

      const parsedMessage = parseChatMessage(messageBody);
      const fallbackSender = pendingChatSenderByContentRef.current.get(parsedMessage.content) ?? null;
      pendingChatSenderByContentRef.current.delete(parsedMessage.content);

      return [createSharedChatMessage(sourceLabel, messageBody, fallbackSender), ...currentMessages].slice(0, 60);
    });
  }, []);

  const createRoomMutation = useMutation({
    mutationKey: ["draft-room-create"],
    mutationFn: () => createDraftRoom(),
    onSuccess: (response) => {
      const nextSession: TestParticipantSession = {
        isHost: response.isHost,
        roomId: response.roomId,
        inviteCode: response.inviteCode,
        nickname: getDisplayNickname(response.nickname, "방장"),
        participantToken: response.participantToken,
        label: "방장",
        role: "host",
      };

      // 방장 세션은 기존 검증처럼 sessionStorage 저장 여부까지 확인함.
      saveDraftParticipantSession(nextSession);
      setHostSession(nextSession);
      setParticipantSessions([]);
      setActiveChatParticipantToken(nextSession.participantToken);
      setSharedChatMessages([]);
      setChatContent("");
      pendingChatSenderByContentRef.current.clear();
      setInviteLinkCopyStatus("");
      setIsParticipantSessionSaved(Boolean(getDraftParticipantSession(nextSession.roomId)));
    },
  });
  const joinRoomMutation = useMutation({
    mutationKey: ["draft-room-join", hostSession?.inviteCode],
    mutationFn: async () => {
      if (!hostSession || !hostSession.inviteCode) {
        throw new Error("먼저 방을 생성하세요.");
      }

      return joinDraftRoomByInviteCode(hostSession.inviteCode);
    },
    onSuccess: (response) => {
      appendParticipantSessions([response]);
    },
  });
  const joinRemainingParticipantsMutation = useMutation({
    mutationKey: ["draft-room-join-remaining", hostSession?.inviteCode, remainingGuestCount],
    mutationFn: async () => {
      if (!hostSession || !hostSession.inviteCode) {
        throw new Error("먼저 방을 생성하세요.");
      }

      const responses: JoinDraftRoomResponse[] = [];

      for (let index = 0; index < remainingGuestCount; index += 1) {
        responses.push(await joinDraftRoomByInviteCode(hostSession.inviteCode));
      }

      return responses;
    },
    onSuccess: (responses) => {
      appendParticipantSessions(responses);
    },
  });
  const startRoomMutation = useMutation({
    mutationKey: ["draft-room-start", hostSession?.roomId, fixedTeamCount, fixedTeamSize],
    mutationFn: async () => {
      if (!hostSession) {
        throw new Error("먼저 방을 생성하세요.");
      }

      if (totalParticipantCount !== fixedTeamCount) {
        throw new Error(
          `방장 포함 참여 인원이 ${fixedTeamCount}명이어야 합니다. 현재 ${totalParticipantCount}/${fixedTeamCount}명입니다.`,
        );
      }

      return startDraftRoom({
        roomId: hostSession.roomId,
        participantToken: hostSession.participantToken,
        request: {
          teamCount: fixedTeamCount,
          teamSize: fixedTeamSize,
        },
      });
    },
  });

  const inviteLink = hostSession?.inviteCode ? createInviteLink(hostSession.inviteCode) : "";
  const handleCopyInviteLink = async () => {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteLinkCopyStatus("초대 링크를 복사했습니다.");
    } catch {
      setInviteLinkCopyStatus("클립보드 복사에 실패했습니다. 링크를 직접 복사하세요.");
    }
  };
  const handlePublishChat = () => {
    const normalizedContent = chatContent.trim();

    if (!activeChatSession || normalizedContent.length === 0) {
      return;
    }

    const publisher = chatPublishersRef.current.get(activeChatSession.participantToken);

    if (!publisher) {
      return;
    }

    pendingChatSenderByContentRef.current.set(normalizedContent, {
      label: getDisplayNickname(activeChatSession.nickname, activeChatSession.label),
      role: activeChatSession.role,
    });
    publisher(normalizedContent);
    setChatContent("");
  };
  const handleRemoveCreatedRoom = () => {
    if (!hostSession) {
      return;
    }

    // 서버 삭제 API가 아직 없으므로 테스트 페이지의 로컬 방 세션만 제거함.
    removeDraftParticipantSession(hostSession.roomId);
    chatPublishersRef.current.clear();
    pendingChatSenderByContentRef.current.clear();
    setHostSession(null);
    setParticipantSessions([]);
    setConnectionStatusByParticipantToken({});
    setActiveChatParticipantToken("");
    setChatContent("");
    setSharedChatMessages([]);
    setInviteLinkCopyStatus("");
    setIsParticipantSessionSaved(false);
    createRoomMutation.reset();
    joinRoomMutation.reset();
    joinRemainingParticipantsMutation.reset();
    startRoomMutation.reset();
  };

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-4 py-5 sm:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <a
            href="/draft"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 text-sm font-semibold text-text-primary"
          >
            <ArrowLeftIcon />
            <span>드래프트로 돌아가기</span>
          </a>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
                WAITING ROOM TEST
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-text-primary">
                드래프트 대기방 통합 테스트
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                5팀 5인 고정 조건으로 방 생성, 참가자 입장, 게임 시작, 통합 채팅 송수신을 검증합니다.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {hostSession ? (
                <button
                  type="button"
                  onClick={handleRemoveCreatedRoom}
                  className="inline-flex h-12 min-w-40 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-bold text-rose-700"
                >
                  방 제거
                </button>
              ) : null}
              <button
                type="button"
                disabled={createRoomMutation.isPending}
                onClick={() => {
                  createRoomMutation.mutate();
                }}
                className="inline-flex h-12 min-w-40 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createRoomMutation.isPending ? "방 생성 중" : "방 생성"}
              </button>
            </div>
          </div>

          {createRoomMutation.isError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {createRoomMutation.error.message}
            </div>
          ) : null}
        </section>

        <SectionCard
          title="방 생성 및 참가자 입장"
          description="teamCount/teamSize는 5로 고정하고, 방장 1명 + 참가자 4명을 맞춘 뒤 게임 시작을 요청합니다."
        >
          {hostSession ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip tone={participantCountTone}>
                  방장 포함 참여 인원 {totalParticipantCount} / {fixedTeamCount}
                </StatusChip>
                <StatusChip>teamCount {fixedTeamCount}</StatusChip>
                <StatusChip>teamSize {fixedTeamSize}</StatusChip>
                <StatusChip>필요 참가자 {requiredGuestCount}명</StatusChip>
                <StatusChip>남은 참가자 {remainingGuestCount}명</StatusChip>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <DetailRow label="roomId" value={String(hostSession.roomId)} />
                <DetailRow label="inviteCode" value={hostSession.inviteCode ?? ""} />
                <DetailRow label="host participantToken" value={hostSession.participantToken} />
                <DetailRow
                  label="sessionStorage 저장"
                  value={isParticipantSessionSaved ? "저장됨" : "저장 확인 실패"}
                />
                <DetailRow label="방 제거 방식" value="로컬 세션 제거 및 STOMP 연결 종료" />
              </div>

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <DetailRow label="참여 링크" value={inviteLink} />
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 text-sm font-bold text-text-primary"
                >
                  <CopyIcon />
                  <span>참여 링크 복사</span>
                </button>
                <button
                  type="button"
                  disabled={!canJoinParticipant || joinRoomMutation.isPending || joinRemainingParticipantsMutation.isPending}
                  onClick={() => {
                    joinRoomMutation.mutate();
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joinRoomMutation.isPending ? "참가 중" : "참가자 1명 입장"}
                </button>
                <button
                  type="button"
                  disabled={!canJoinParticipant || joinRoomMutation.isPending || joinRemainingParticipantsMutation.isPending}
                  onClick={() => {
                    joinRemainingParticipantsMutation.mutate();
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-surface-muted px-4 text-sm font-bold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joinRemainingParticipantsMutation.isPending ? "전체 입장 중" : "남은 참가자 모두 입장"}
                </button>
              </div>

              {inviteLinkCopyStatus ? (
                <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-text-secondary">
                  {inviteLinkCopyStatus}
                </div>
              ) : null}
              {joinRoomMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {joinRoomMutation.error.message}
                </div>
              ) : null}
              {joinRemainingParticipantsMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {joinRemainingParticipantsMutation.error.message}
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {participantSessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-text-secondary">
                    참가자를 입장시키면 participantToken이 여기에 표시됩니다.
                  </div>
                ) : (
                  participantSessions.map((participantSession) => (
                    <ParticipantInfoCard
                      key={participantSession.participantToken}
                      session={participantSession}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-text-secondary">
              방 생성 버튼을 누르면 inviteCode, 방장 토큰, 참가자 입장 테스트가 열립니다.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="게임 시작"
          description="5팀 5인 고정값으로 PATCH /settings를 호출하고 WebSocket 게임 시작 이벤트를 확인합니다."
        >
          <div className="grid gap-4 xl:grid-cols-[auto_auto_auto_minmax(0,1fr)]">
            <CompactMetric label="teamCount" value={String(fixedTeamCount)} />
            <CompactMetric label="teamSize" value={String(fixedTeamSize)} />
            <button
              type="button"
              disabled={!canStartRoom || startRoomMutation.isPending}
              onClick={() => {
                startRoomMutation.mutate();
              }}
              className="mt-auto inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {startRoomMutation.isPending ? "시작 요청 중" : "게임 시작 요청"}
            </button>
            <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
              <p className="text-xs font-semibold text-text-muted">Request</p>
              <pre className="mt-1 text-xs leading-5 text-text-primary">
                {JSON.stringify(
                  {
                    method: "PATCH",
                    path: hostSession ? `/api/drafts/rooms/${hostSession.roomId}/settings` : "",
                    headers: {
                      "X-Participant-Token": hostSession?.participantToken ?? "",
                    },
                    body: { teamCount: fixedTeamCount, teamSize: fixedTeamSize },
                    required: `방장 포함 ${fixedTeamCount}명 필요`,
                    currentParticipants: totalParticipantCount,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>

          {!canStartRoom ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              게임 시작 전 방장 포함 참여 인원을 {fixedTeamCount}명으로 맞춰야 합니다. 현재 {totalParticipantCount}/{fixedTeamCount}명입니다.
            </div>
          ) : null}
          {startRoomMutation.isSuccess ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              게임 시작 API가 성공했습니다. 방 이벤트 목록에서 redirectUrl 포함 메시지를 확인하세요.
            </div>
          ) : null}
          {startRoomMutation.isError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {startRoomMutation.error.message}
            </div>
          ) : null}
        </SectionCard>

        <SharedChatPanel
          activeParticipantToken={effectiveActiveChatParticipantToken}
          activeSessionStatus={activeSessionStatus}
          canPublishChat={canPublishChat}
          chatContent={chatContent}
          messages={sharedChatMessages}
          onActiveParticipantTokenChange={setActiveChatParticipantToken}
          onChatContentChange={setChatContent}
          onPublishChat={handlePublishChat}
          sessions={allSessions}
        />

        <div className="grid gap-5">
          {hostSession ? (
            <DraftRoomRealtimeTester
              key={`host-${hostSession.roomId}`}
              onRoomEvent={applyParticipantNicknamesFromRoomEvent}
              session={hostSession}
              onRegisterChatPublisher={handleRegisterChatPublisher}
              onSharedChatMessage={appendSharedChatMessage}
              onUnregisterChatPublisher={handleUnregisterChatPublisher}
            />
          ) : null}
          {participantSessions.map((participantSession) => (
            <DraftRoomRealtimeTester
              key={participantSession.participantToken}
              onRoomEvent={applyParticipantNicknamesFromRoomEvent}
              session={participantSession}
              onRegisterChatPublisher={handleRegisterChatPublisher}
              onSharedChatMessage={appendSharedChatMessage}
              onUnregisterChatPublisher={handleUnregisterChatPublisher}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

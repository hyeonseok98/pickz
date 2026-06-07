"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createDraftRoom, joinDraftRoomByInviteCode, startDraftRoom } from "@/apis/drafts";
import { useDraftCreateStore } from "@/stores/drafts";
import { getDraftParticipantSession, saveDraftParticipantSession } from "@/utils";
import { useDraftRoomStomp } from "./use-draft-room-stomp";

interface DraftInviteParticipantItem {
  id: string;
  isHost: boolean;
  nickname: string;
  status: string;
}

export interface DraftInviteRoleSlot {
  id: string;
  teamNumber: number;
}

interface UseDraftInviteRoomParams {
  coachEnabled?: boolean;
  draftType: "snake" | "auction";
  headCoachEnabled?: boolean;
  inviteCode?: string;
  mode: "solo" | "party";
  teamCount: string;
  teamSize: string;
}

interface UseDraftInviteRoomResult {
  backHref: string;
  bootstrapErrorSource: "create_room" | "join_room" | "session" | "stomp" | "start_draft" | null;
  bootstrapStatus: "idle" | "creating_room" | "joining_room" | "ready" | "bootstrap_error";
  connectionStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  errorMessage: string;
  infoMessage: string;
  inviteCode?: string;
  inviteLink: string;
  isHost: boolean;
  isInitializing: boolean;
  isPartyMode: boolean;
  isStarting: boolean;
  participantRosterCount: number;
  participantCountLabel: string;
  participants: DraftInviteParticipantItem[];
  primaryActionDisabled: boolean;
  primaryActionLabel: string;
  roleSlots: DraftInviteRoleSlot[];
  roomId: number | null;
  teamCountValue: number;
  tournamentLabel: string;
  handleCopyInviteLink: () => Promise<void>;
  handleMoveRoleSlot: (fromIndex: number, toIndex: number) => void;
  handleStartDraft: () => void;
}

interface DraftParticipantEventPayload {
  newParticipant?: string;
  nicknames: string[];
  totalCount: number;
}

function createInviteLink({
  baseUrl,
  coachEnabled,
  draftType,
  headCoachEnabled,
  inviteCode,
  teamCount,
  teamSize,
}: {
  baseUrl: string;
  coachEnabled?: boolean;
  draftType: "snake" | "auction";
  headCoachEnabled?: boolean;
  inviteCode: string;
  teamCount: string;
  teamSize: string;
}) {
  const searchParams = new URLSearchParams({
    draftType,
    mode: "party",
    teamCount,
    teamSize,
  });

  if (headCoachEnabled) {
    searchParams.set("headCoachEnabled", "true");
  }

  if (coachEnabled) {
    searchParams.set("coachEnabled", "true");
  }

  return `${baseUrl}/join/${inviteCode}?${searchParams.toString()}`;
}

function createParticipantItem({
  id,
  isHost,
  nickname,
  status,
}: DraftInviteParticipantItem): DraftInviteParticipantItem {
  return {
    id,
    isHost,
    nickname,
    status,
  };
}

function getDisplayNickname(nickname: string | undefined, fallbackLabel: string) {
  const normalizedNickname = nickname?.trim();

  if (!normalizedNickname || normalizedNickname === "null") {
    return fallbackLabel;
  }

  return normalizedNickname;
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseParticipantEvent(messageBody: string): DraftParticipantEventPayload | null {
  try {
    const parsedValue = JSON.parse(messageBody) as unknown;

    if (!isRecordValue(parsedValue)) {
      return null;
    }

    const eventPayload = isRecordValue(parsedValue.payload) ? parsedValue.payload : parsedValue;
    const nicknames = Array.isArray(eventPayload.nicknames)
      ? eventPayload.nicknames
          .filter((nickname): nickname is string => typeof nickname === "string")
          .map((nickname) => nickname.trim())
          .filter((nickname) => nickname.length > 0 && nickname !== "null")
      : [];
    const newParticipant =
      typeof eventPayload.newParticipant === "string" && eventPayload.newParticipant.trim().length > 0
        ? eventPayload.newParticipant.trim()
        : undefined;
    const totalCount = typeof eventPayload.totalCount === "number" ? eventPayload.totalCount : nicknames.length;

    if (nicknames.length === 0 && totalCount === 0 && !newParticipant) {
      return null;
    }

    return {
      newParticipant,
      nicknames,
      totalCount,
    };
  } catch {
    return null;
  }
}

function parseStartEvent(messageBody: string): { redirectUrl: string } | null {
  try {
    const parsedValue = JSON.parse(messageBody) as unknown;

    if (!isRecordValue(parsedValue) || parsedValue.code !== "SUCCESS" || !isRecordValue(parsedValue.payload)) {
      return null;
    }

    return typeof parsedValue.payload.redirectUrl === "string"
      ? { redirectUrl: parsedValue.payload.redirectUrl }
      : null;
  } catch {
    return null;
  }
}

function mergeParticipantList({
  currentParticipants,
  eventPayload,
  fallbackHostName,
}: {
  currentParticipants: DraftInviteParticipantItem[];
  eventPayload: DraftParticipantEventPayload;
  fallbackHostName: string;
}) {
  const nextNicknames =
    eventPayload.nicknames.length > 0
      ? eventPayload.nicknames
      : eventPayload.newParticipant
        ? [...currentParticipants.map((participant) => participant.nickname), eventPayload.newParticipant]
        : currentParticipants.map((participant) => participant.nickname);
  const normalizedTotalCount = Math.max(eventPayload.totalCount, nextNicknames.length, 1);
  const paddedNicknames = Array.from({ length: normalizedTotalCount }, (_, index) => {
    const existingNickname = nextNicknames[index];

    if (existingNickname) {
      return existingNickname;
    }

    if (index === 0) {
      return fallbackHostName;
    }

    return `참가자 ${index}`;
  });

  return paddedNicknames.map((nickname, index) => {
    const matchedParticipant = currentParticipants.find((participant) => participant.nickname === nickname);

    return createParticipantItem({
      id: matchedParticipant?.id ?? `${index}-${nickname}`,
      isHost: matchedParticipant?.isHost ?? index === 0,
      nickname,
      status:
        nickname === fallbackHostName && index === 0
          ? "방장"
          : matchedParticipant
            ? matchedParticipant.status
            : "새로 입장",
    });
  });
}

export function useDraftInviteRoom({
  coachEnabled,
  draftType,
  headCoachEnabled,
  inviteCode: initialInviteCode,
  mode,
  teamCount: teamCountFromQuery,
  teamSize: teamSizeFromQuery,
}: UseDraftInviteRoomParams): UseDraftInviteRoomResult {
  const router = useRouter();
  const { participantIds, tournamentId } = useDraftCreateStore();
  const teamCountValue = Number(teamCountFromQuery);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<DraftInviteParticipantItem[]>([]);
  const [participantToken, setParticipantToken] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<UseDraftInviteRoomResult["bootstrapStatus"]>("idle");
  const [bootstrapErrorSource, setBootstrapErrorSource] =
    useState<UseDraftInviteRoomResult["bootstrapErrorSource"]>(null);
  const [roleSlots, setRoleSlots] = useState<DraftInviteRoleSlot[]>(() =>
    Array.from({ length: teamCountValue }, (_, index) => ({
      id: `team-slot-${index + 1}`,
      teamNumber: index + 1,
    })),
  );
  const bootstrapCompletedRef = useRef(false);

  const createRoomMutation = useMutation({
    mutationFn: () => createDraftRoom(),
    onMutate: () => {
      setBootstrapStatus("creating_room");
      setBootstrapErrorSource(null);
      setErrorMessage("");
      setInfoMessage("드래프트 방을 생성하는 중입니다.");
    },
    onSuccess: (response) => {
      saveDraftParticipantSession({
        inviteCode: response.inviteCode,
        isHost: response.isHost,
        nickname: response.nickname,
        participantToken: response.participantToken,
        roomId: response.roomId,
      });
      setInviteCode(response.inviteCode);
      setIsHost(response.isHost);
      setParticipantToken(response.participantToken);
      setRoomId(response.roomId);
      setParticipants([
        createParticipantItem({
          id: response.participantToken,
          isHost: true,
          nickname: getDisplayNickname(response.nickname, "방장"),
          status: "입장 완료",
        }),
      ]);
      setBootstrapStatus("ready");
      setInfoMessage("방이 생성되었습니다. 참가자를 초대한 뒤 시작할 수 있습니다.");
      setErrorMessage("");
    },
    onError: (error) => {
      setBootstrapStatus("bootstrap_error");
      setBootstrapErrorSource("create_room");
      setErrorMessage(error instanceof Error ? error.message : "방 생성에 실패했습니다.");
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: (code: string) => joinDraftRoomByInviteCode(code),
    onMutate: () => {
      setBootstrapStatus("joining_room");
      setBootstrapErrorSource(null);
      setErrorMessage("");
      setInfoMessage("초대 링크로 방에 입장하는 중입니다.");
    },
    onSuccess: (response) => {
      saveDraftParticipantSession({
        inviteCode: initialInviteCode,
        isHost: response.isHost,
        nickname: response.nickname,
        participantToken: response.participantToken,
        roomId: response.roomId,
      });
      setIsHost(response.isHost);
      setParticipantToken(response.participantToken);
      setRoomId(response.roomId);
      setParticipants([
        createParticipantItem({
          id: response.participantToken,
          isHost: false,
          nickname: getDisplayNickname(response.nickname, "참가자"),
          status: "입장 완료",
        }),
      ]);
      setBootstrapStatus("ready");
      setInfoMessage("대기실에 입장했습니다. 방장이 시작할 때까지 기다려 주세요.");
      setErrorMessage("");
    },
    onError: (error) => {
      setBootstrapStatus("bootstrap_error");
      setBootstrapErrorSource("join_room");
      setErrorMessage(error instanceof Error ? error.message : "방 참여에 실패했습니다.");
    },
  });
  const { mutate: createRoom } = createRoomMutation;
  const { mutate: joinRoom } = joinRoomMutation;

  const startDraftMutation = useMutation({
    mutationFn: async () => {
      if (roomId === null || participantToken.trim().length === 0) {
        throw new Error("방 정보가 준비되지 않았습니다.");
      }

      await startDraftRoom({
        participantToken,
        request: {
          teamCount: Number(teamCountFromQuery),
          teamSize: Number(teamSizeFromQuery),
        },
        roomId,
      });
    },
    onSuccess: () => {
      setBootstrapErrorSource(null);
      setInfoMessage("게임 시작 요청을 보냈습니다. 시작 이벤트를 기다리는 중입니다.");
      setErrorMessage("");
    },
    onError: (error) => {
      setBootstrapErrorSource("start_draft");
      setErrorMessage(error instanceof Error ? error.message : "게임 시작 요청에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (mode !== "party" || bootstrapCompletedRef.current) {
      return;
    }

    bootstrapCompletedRef.current = true;

    if (initialInviteCode) {
      joinRoom(initialInviteCode);
      return;
    }

    createRoom();
  }, [createRoom, initialInviteCode, joinRoom, mode]);

  const { connectionStatus } = useDraftRoomStomp({
    roomId: roomId ?? 0,
    participantToken,
    onConnectionError: (message) => {
      setBootstrapStatus("bootstrap_error");
      setBootstrapErrorSource("stomp");
      setErrorMessage(message);
    },
    onErrorMessage: (message) => {
      setBootstrapErrorSource("stomp");
      setErrorMessage(message);
    },
    onRoomMessage: (messageBody) => {
      const startEvent = parseStartEvent(messageBody);

      if (startEvent) {
        router.push(startEvent.redirectUrl);
        return;
      }

      const participantEvent = parseParticipantEvent(messageBody);

      if (!participantEvent) {
        return;
      }

      setParticipants((currentParticipants) => {
        const session = roomId ? getDraftParticipantSession(roomId) : null;
        const fallbackHostName = session?.isHost ? getDisplayNickname(session.nickname, "방장") : "방장";

        return mergeParticipantList({
          currentParticipants,
          eventPayload: participantEvent,
          fallbackHostName,
        });
      });
      setInfoMessage(`현재 ${participantEvent.totalCount}명이 대기실에 입장했습니다.`);
    },
  });
  const inviteLink = useSyncExternalStore(
    () => () => undefined,
    () => {
      if (!inviteCode) {
        return "";
      }

      return createInviteLink({
        baseUrl: window.location.origin,
        coachEnabled,
        draftType,
        headCoachEnabled,
        inviteCode,
        teamCount: teamCountFromQuery,
        teamSize: teamSizeFromQuery,
      });
    },
    () => "",
  );

  const isInitializing = createRoomMutation.isPending || joinRoomMutation.isPending;
  const isStarting = startDraftMutation.isPending;
  const isPartyMode = mode === "party";
  const participantCountLabel = `${participants.length} / ${teamCountFromQuery} 입장`;
  const primaryActionDisabled =
    !isHost || isStarting || participants.length < teamCountValue || roomId === null;
  const primaryActionLabel = isHost ? "게임 시작하기" : "방장 시작 대기 중";
  const tournamentLabel = tournamentId === "pickz-invitational" ? "2026 자낳대" : "사용자 설정";
  const backSearchParams = new URLSearchParams({
    draftType,
    mode: "party",
    teamCount: teamCountFromQuery,
    teamSize: teamSizeFromQuery,
  });

  if (headCoachEnabled) {
    backSearchParams.set("headCoachEnabled", "true");
  }

  if (coachEnabled) {
    backSearchParams.set("coachEnabled", "true");
  }

  const backHref = `/draft/create/streamers?${backSearchParams.toString()}`;

  return {
    backHref,
    bootstrapErrorSource,
    bootstrapStatus,
    connectionStatus: roomId === null || participantToken.trim().length === 0 ? "idle" : connectionStatus,
    errorMessage,
    infoMessage,
    inviteCode,
    inviteLink,
    isHost,
    isInitializing,
    isPartyMode,
    isStarting,
    participantRosterCount: participantIds.length,
    participantCountLabel,
    participants,
    primaryActionDisabled,
    primaryActionLabel,
    roleSlots,
    roomId,
    teamCountValue,
    tournamentLabel,
    handleCopyInviteLink: async () => {
      if (!inviteLink) {
        return;
      }

      try {
        await navigator.clipboard.writeText(inviteLink);
        setInfoMessage("초대 링크를 복사했습니다.");
        setErrorMessage("");
      } catch {
        setErrorMessage("초대 링크 복사에 실패했습니다.");
      }
    },
    handleStartDraft: () => {
      startDraftMutation.mutate();
    },
    handleMoveRoleSlot: (fromIndex, toIndex) => {
      if (fromIndex === toIndex) {
        return;
      }

      setRoleSlots((currentRoleSlots) => {
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= currentRoleSlots.length ||
          toIndex >= currentRoleSlots.length
        ) {
          return currentRoleSlots;
        }

        const nextRoleSlots = [...currentRoleSlots];
        const [movedRoleSlot] = nextRoleSlots.splice(fromIndex, 1);

        nextRoleSlots.splice(toIndex, 0, movedRoleSlot);

        return nextRoleSlots;
      });
    },
  };
}

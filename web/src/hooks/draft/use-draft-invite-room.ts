"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveDraftRoomStreamerPool, startDraftRoom } from "@/apis/draft";
import { useDraftRoomSettingsStore, useDraftStreamerSetupStore } from "@/stores/draft";
import type {
  DraftInviteParticipantItem,
  DraftInviteRoomErrorSource,
  DraftInviteRoomStatus,
  DraftInviteRoleSlot,
} from "@/types/draft";
import {
  createDraftRoomWithPendingRequestCache,
  createDraftRoomStreamerTeamSlotsFromBoard,
  createDraftRoomCreateRequest,
  getDraftInviteDisplayNickname,
  getDraftParticipantSession,
  joinDraftRoomByInviteCodeWithPendingRequestCache,
  mergeDraftInviteParticipantList,
  parseDraftParticipantEvent,
  parseDraftStartEvent,
  saveDraftParticipantSession,
} from "@/utils";
import { useDraftInviteLink } from "./invite/use-draft-invite-link";
import { useDraftRoomStomp } from "./use-draft-room-stomp";

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
  connectionStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  errorMessage: string;
  infoMessage: string;
  inviteCode?: string;
  inviteLink: string;
  inviteRoomErrorSource: DraftInviteRoomErrorSource;
  inviteRoomStatus: DraftInviteRoomStatus;
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

async function saveDraftRoomStreamerPoolWithoutBlockingInvite({
  participantToken,
  roomId,
  teamStreamerSlots,
}: Parameters<typeof saveDraftRoomStreamerPool>[0]) {
  try {
    await saveDraftRoomStreamerPool({
      participantToken,
      roomId,
      teamStreamerSlots,
    });

    return "";
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "스트리머 풀 저장 API 호출에 실패했습니다.";
  }
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
  const { roomTitle, tournamentId } = useDraftRoomSettingsStore();
  const { board, participantIds } = useDraftStreamerSetupStore();
  const teamCountValue = Number(teamCountFromQuery);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<DraftInviteParticipantItem[]>([]);
  const [participantToken, setParticipantToken] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [inviteRoomStatus, setInviteRoomStatus] = useState<DraftInviteRoomStatus>("idle");
  const [inviteRoomErrorSource, setInviteRoomErrorSource] =
    useState<DraftInviteRoomErrorSource>(null);
  const [roleSlots, setRoleSlots] = useState<DraftInviteRoleSlot[]>(() =>
    Array.from({ length: teamCountValue }, (_, index) => ({
      id: `team-slot-${index + 1}`,
      teamNumber: index + 1,
    })),
  );
  const hasInitializedInviteRoomRef = useRef(false);

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const createdDraftRoom = await createDraftRoomWithPendingRequestCache(
        createDraftRoomCreateRequest({
          draftType,
          mode,
          roomTitle,
          teamCount: teamCountFromQuery,
          teamSize: teamSizeFromQuery,
          tournamentId,
        }),
      );
      const teamStreamerSlots = createDraftRoomStreamerTeamSlotsFromBoard(board, teamCountValue);

      const streamerPoolSaveErrorMessage = await saveDraftRoomStreamerPoolWithoutBlockingInvite({
        participantToken: createdDraftRoom.participantToken,
        roomId: createdDraftRoom.roomId,
        teamStreamerSlots,
      });

      return {
        ...createdDraftRoom,
        streamerPoolSaveErrorMessage,
      };
    },
    onMutate: () => {
      setInviteRoomStatus("creatingRoom");
      setInviteRoomErrorSource(null);
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
        {
          id: response.participantToken,
          isHost: true,
          nickname: getDraftInviteDisplayNickname(response.nickname, "방장"),
          status: "입장 완료",
        },
      ]);
      setInviteRoomStatus("ready");
      setInfoMessage(
        response.streamerPoolSaveErrorMessage
          ? `방은 생성되었습니다. 다만 스트리머 풀 저장은 실패했습니다: ${response.streamerPoolSaveErrorMessage}`
          : "방이 생성되었습니다. 참가자를 초대한 뒤 시작할 수 있습니다.",
      );
      setErrorMessage("");
    },
    onError: (error) => {
      setInviteRoomStatus("failed");
      setInviteRoomErrorSource("createRoom");
      setErrorMessage(error instanceof Error ? error.message : "방 생성에 실패했습니다.");
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: (code: string) => joinDraftRoomByInviteCodeWithPendingRequestCache(code),
    onMutate: () => {
      setInviteRoomStatus("joiningRoom");
      setInviteRoomErrorSource(null);
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
        {
          id: response.participantToken,
          isHost: false,
          nickname: getDraftInviteDisplayNickname(response.nickname, "참가자"),
          status: "입장 완료",
        },
      ]);
      setInviteRoomStatus("ready");
      setInfoMessage("대기실에 입장했습니다. 방장이 시작할 때까지 기다려 주세요.");
      setErrorMessage("");
    },
    onError: (error) => {
      setInviteRoomStatus("failed");
      setInviteRoomErrorSource("joinRoom");
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
        roomId,
      });
    },
    onSuccess: () => {
      setInviteRoomErrorSource(null);
      setInfoMessage("게임 시작 요청을 보냈습니다. 시작 이벤트를 기다리는 중입니다.");
      setErrorMessage("");
    },
    onError: (error) => {
      setInviteRoomErrorSource("startDraft");
      setErrorMessage(error instanceof Error ? error.message : "게임 시작 요청에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (mode !== "party" || hasInitializedInviteRoomRef.current) {
      return;
    }

    hasInitializedInviteRoomRef.current = true;

    if (initialInviteCode) {
      joinRoom(initialInviteCode);
      return;
    }

    createRoom();
  }, [createRoom, initialInviteCode, joinRoom, mode]);

  const handleParticipantRoomMessage = (messageBody: string) => {
    const participantEvent = parseDraftParticipantEvent(messageBody);

    if (!participantEvent) {
      return;
    }

    setParticipants((currentParticipants) => {
      const session = roomId ? getDraftParticipantSession(roomId) : null;
      const fallbackHostName = session?.isHost
        ? getDraftInviteDisplayNickname(session.nickname, "방장")
        : "방장";

      return mergeDraftInviteParticipantList({
        currentParticipants,
        eventPayload: participantEvent,
        fallbackHostName,
      });
    });
    setInfoMessage(`현재 ${participantEvent.totalCount}명이 대기실에 입장했습니다.`);
  };

  const { connectionStatus } = useDraftRoomStomp({
    roomId: roomId ?? 0,
    participantToken,
    onConnectionError: (message) => {
      setInviteRoomStatus("failed");
      setInviteRoomErrorSource("stomp");
      setErrorMessage(message);
    },
    onErrorMessage: (message) => {
      setInviteRoomErrorSource("stomp");
      setErrorMessage(message);
    },
    onRoomMessage: (messageBody) => {
      const startEvent = parseDraftStartEvent(messageBody);

      if (startEvent) {
        router.push(startEvent.redirectUrl);
        return;
      }

      // 구버전 room topic 참가자 이벤트까지 처리
      handleParticipantRoomMessage(messageBody);
    },
    onParticipantsMessage: handleParticipantRoomMessage,
    onRoomDeletedMessage: () => {
      setInviteRoomStatus("failed");
      setInviteRoomErrorSource("session");
      setErrorMessage("방이 종료되었습니다. 드래프트 화면으로 다시 이동해 주세요.");
      setInfoMessage("");
    },
  });
  const inviteLink = useDraftInviteLink({
    coachEnabled,
    draftType,
    headCoachEnabled,
    inviteCode,
    teamCount: teamCountFromQuery,
    teamSize: teamSizeFromQuery,
  });

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
    connectionStatus: roomId === null || participantToken.trim().length === 0 ? "idle" : connectionStatus,
    errorMessage,
    infoMessage,
    inviteCode,
    inviteLink,
    inviteRoomErrorSource,
    inviteRoomStatus,
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

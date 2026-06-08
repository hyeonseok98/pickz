import type {
  CreateDraftRoomRequest,
  CreateDraftRoomResponse,
  DraftRoomParticipantTokenParams,
  DraftRoomStateResponse,
  DraftRoomStreamerPoolResponse,
  JoinDraftRoomResponse,
  SaveDraftRoomStreamerPoolParams,
  SelectDraftRoomCoachParams,
  StartDraftRoomParams,
} from "@/types/draft";

const defaultCreateDraftRoomRequest: CreateDraftRoomRequest = {
  draftMode: "SNAKE",
  participationType: "TOGETHER",
  preset: "custom",
  teamCount: 5,
  teamSize: 5,
  title: "Pickz 드래프트 방",
};

function createApiPath(pathname: string) {
  return `/api/${pathname.replace(/^\/+/, "")}`;
}

const draftRoomCreateFetchCredentials = "omit" satisfies RequestCredentials;
const draftRoomInviteFetchCredentials = "omit" satisfies RequestCredentials;
const draftRoomParticipantTokenFetchCredentials = "omit" satisfies RequestCredentials;

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();

  return text.length > 0 ? text : null;
}

function getApiErrorMessage(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (typeof payload === "string" && payload.length > 0) {
    return payload;
  }

  return fallbackMessage;
}

function createApiError(response: Response, payload: unknown, fallbackMessage: string) {
  const message = getApiErrorMessage(payload, fallbackMessage);

  return new Error(`${message} (HTTP ${response.status})`);
}

function normalizeNicknameValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0 || trimmedValue === "null") {
    return undefined;
  }

  return trimmedValue;
}

function readNicknameFromPayload(payload: {
  nickName?: unknown;
  nickname?: unknown;
}) {
  return (
    normalizeNicknameValue(payload.nickname) ??
    normalizeNicknameValue(payload.nickName)
  );
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readIsHostValue(payload: { isHost?: unknown }, fallbackValue: boolean) {
  return typeof payload.isHost === "boolean" ? payload.isHost : fallbackValue;
}

function readSelectedCoachNameValue(payload: { selectedCoachName?: unknown }) {
  return typeof payload.selectedCoachName === "string" && payload.selectedCoachName.trim().length > 0
    ? payload.selectedCoachName.trim()
    : undefined;
}

function readTurnOrderValue(payload: { turnOrder?: unknown }) {
  return typeof payload.turnOrder === "number" ? payload.turnOrder : undefined;
}

function readReadyValue(payload: { isReady?: unknown }) {
  return typeof payload.isReady === "boolean" ? payload.isReady : undefined;
}

function isCreateDraftRoomResponse(payload: unknown): payload is CreateDraftRoomResponse {
  if (!isRecordValue(payload)) {
    return false;
  }

  return (
    typeof payload.roomId === "number" &&
    typeof payload.inviteCode === "string" &&
    typeof payload.participantToken === "string"
  );
}

function isJoinDraftRoomResponse(payload: unknown): payload is JoinDraftRoomResponse {
  if (!isRecordValue(payload)) {
    return false;
  }

  return (
    typeof payload.participantToken === "string" &&
    typeof payload.roomId === "number"
  );
}

function isDraftRoomStreamerPoolResponse(payload: unknown): payload is DraftRoomStreamerPoolResponse {
  if (!isRecordValue(payload)) {
    return false;
  }

  return (
    Array.isArray(payload.top) &&
    Array.isArray(payload.jug) &&
    Array.isArray(payload.mid) &&
    Array.isArray(payload.adc) &&
    Array.isArray(payload.sup) &&
    Array.isArray(payload.coach)
  );
}

function isDraftRoomStateResponse(payload: unknown): payload is DraftRoomStateResponse {
  if (!isRecordValue(payload) || !isRecordValue(payload.draftConfig)) {
    return false;
  }

  return typeof payload.roomId === "number" && typeof payload.roomStatus === "string";
}

function normalizeCreateDraftRoomResponse(payload: CreateDraftRoomResponse) {
  return {
    ...payload,
    isHost: readIsHostValue(payload, true),
    nickname: readNicknameFromPayload(payload),
    selectedCoachName: readSelectedCoachNameValue(payload),
    turnOrder: readTurnOrderValue(payload),
    isReady: readReadyValue(payload),
  };
}

function normalizeJoinDraftRoomResponse(payload: JoinDraftRoomResponse) {
  return {
    ...payload,
    isHost: readIsHostValue(payload, false),
    nickname: readNicknameFromPayload(payload),
    selectedCoachName: readSelectedCoachNameValue(payload),
    turnOrder: readTurnOrderValue(payload),
    isReady: readReadyValue(payload),
  };
}

export async function createDraftRoom(
  request: CreateDraftRoomRequest = defaultCreateDraftRoomRequest,
) {
  const response = await fetch(createApiPath("drafts/rooms"), {
    method: "POST",
    cache: "no-store",
    credentials: draftRoomCreateFetchCredentials,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 방 생성 API 호출에 실패했습니다.");
  }

  if (!isCreateDraftRoomResponse(payload)) {
    throw new Error("드래프트 방 생성 응답 형식이 올바르지 않습니다.");
  }

  return normalizeCreateDraftRoomResponse(payload);
}

export async function joinDraftRoomByInviteCode(inviteCode: string) {
  const response = await fetch(
    createApiPath(`drafts/rooms/invites/${encodeURIComponent(inviteCode)}/participants`),
    {
      method: "POST",
      cache: "no-store",
      credentials: draftRoomInviteFetchCredentials,
      headers: {
        Accept: "application/json",
      },
    },
  );
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 방 참여 API 호출에 실패했습니다.");
  }

  if (!isJoinDraftRoomResponse(payload)) {
    throw new Error("드래프트 방 참여 응답 형식이 올바르지 않습니다.");
  }

  return normalizeJoinDraftRoomResponse(payload);
}

export async function startDraftRoom({
  participantToken,
  roomId,
}: StartDraftRoomParams) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/start`), {
    method: "POST",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "text/plain",
      "X-Participant-Token": participantToken,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 시작 API 호출에 실패했습니다.");
  }
}

export async function getDraftRoomStreamerPool(roomId: number) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/streamers`), {
    method: "GET",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "application/json",
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 스트리머 풀 조회 API 호출에 실패했습니다.");
  }

  if (!isDraftRoomStreamerPoolResponse(payload)) {
    throw new Error("드래프트 스트리머 풀 응답 형식이 올바르지 않습니다.");
  }

  return payload;
}

export async function saveDraftRoomStreamerPool({
  participantToken,
  roomId,
  teamStreamerSlots,
}: SaveDraftRoomStreamerPoolParams) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/streamers`), {
    method: "POST",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
      "X-Participant-Token": participantToken,
    },
    body: JSON.stringify(teamStreamerSlots),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 스트리머 풀 저장 API 호출에 실패했습니다.");
  }
}

export async function selectDraftRoomCoach({
  participantToken,
  request,
  roomId,
}: SelectDraftRoomCoachParams) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/participants/coach`), {
    method: "PATCH",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
      "X-Participant-Token": participantToken,
    },
    body: JSON.stringify(request),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 감독 선택 API 호출에 실패했습니다.");
  }
}

export async function getDraftRoomState(roomId: number) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/state`), {
    method: "GET",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "application/json",
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 게임 상태 조회 API 호출에 실패했습니다.");
  }

  if (!isDraftRoomStateResponse(payload)) {
    throw new Error("드래프트 게임 상태 응답 형식이 올바르지 않습니다.");
  }

  return payload;
}

export async function deleteDraftRoom({
  participantToken,
  roomId,
}: DraftRoomParticipantTokenParams) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}`), {
    method: "DELETE",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "text/plain",
      "X-Participant-Token": participantToken,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 방 삭제 API 호출에 실패했습니다.");
  }
}

export async function leaveDraftRoom({
  participantToken,
  roomId,
}: DraftRoomParticipantTokenParams) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/participants`), {
    method: "DELETE",
    cache: "no-store",
    credentials: draftRoomParticipantTokenFetchCredentials,
    headers: {
      Accept: "text/plain",
      "X-Participant-Token": participantToken,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 방 퇴장 API 호출에 실패했습니다.");
  }
}

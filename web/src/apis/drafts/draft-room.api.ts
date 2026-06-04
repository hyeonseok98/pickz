import type {
  CreateDraftRoomRequest,
  CreateDraftRoomResponse,
  JoinDraftRoomResponse,
  StartDraftRoomParams,
} from "@/types";

const defaultCreateDraftRoomRequest: CreateDraftRoomRequest = {
  mode: "TOGETHER",
  ruleName: "SNAKE",
};

function createApiPath(pathname: string) {
  return `/api/${pathname.replace(/^\/+/, "")}`;
}

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

function readNicknameFromPayload(payload: Record<string, unknown>) {
  return (
    normalizeNicknameValue(payload.nickname) ??
    normalizeNicknameValue(payload.nickName)
  );
}

function isCreateDraftRoomResponse(payload: unknown): payload is CreateDraftRoomResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const recordPayload = payload as Record<string, unknown>;

  return (
    typeof recordPayload.roomId === "number" &&
    typeof recordPayload.inviteCode === "string" &&
    typeof recordPayload.participantToken === "string"
  );
}

function isJoinDraftRoomResponse(payload: unknown): payload is JoinDraftRoomResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const recordPayload = payload as Record<string, unknown>;

  return typeof recordPayload.participantToken === "string";
}

function normalizeCreateDraftRoomResponse(payload: CreateDraftRoomResponse) {
  const recordPayload = payload as unknown as Record<string, unknown>;

  return {
    ...payload,
    nickname: readNicknameFromPayload(recordPayload),
  };
}

function normalizeJoinDraftRoomResponse(payload: JoinDraftRoomResponse) {
  const recordPayload = payload as unknown as Record<string, unknown>;

  return {
    ...payload,
    nickname: readNicknameFromPayload(recordPayload),
  };
}

export async function createDraftRoom(
  request: CreateDraftRoomRequest = defaultCreateDraftRoomRequest,
) {
  const response = await fetch(createApiPath("drafts/rooms"), {
    method: "POST",
    cache: "no-store",
    credentials: "include",
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
      credentials: "include",
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
  request,
  roomId,
}: StartDraftRoomParams) {
  const response = await fetch(createApiPath(`drafts/rooms/${roomId}/settings`), {
    method: "PATCH",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Participant-Token": participantToken,
    },
    body: JSON.stringify(request),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw createApiError(response, payload, "드래프트 방 설정 및 시작 API 호출에 실패했습니다.");
  }
}

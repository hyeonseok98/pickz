import type { DraftParticipantSession } from "@/types/draft";

const draftParticipantStorageKeyPrefix = "pickz:draft-participant";

function createDraftParticipantStorageKey(roomId: number) {
  return `${draftParticipantStorageKeyPrefix}:${roomId}`;
}

function getSessionStorage() {
  // 브라우저에서만 sessionStorage 접근 가능
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function isOptionalString(value: unknown) {
  return typeof value === "undefined" || typeof value === "string";
}

function isDraftParticipantSession(value: unknown): value is DraftParticipantSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const recordValue = value as Record<string, unknown>;

  return (
    isOptionalString(recordValue.inviteCode) &&
    typeof recordValue.isHost === "boolean" &&
    isOptionalString(recordValue.nickname) &&
    typeof recordValue.participantToken === "string" &&
    typeof recordValue.roomId === "number" &&
    Number.isFinite(recordValue.roomId)
  );
}

/** 대기실 새로고침 재접속을 위한 참가자 세션 저장 */
export function saveDraftParticipantSession(session: DraftParticipantSession) {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.setItem(createDraftParticipantStorageKey(session.roomId), JSON.stringify(session));
}

/** 대기실 새로고침 시 저장된 참가자 세션 조회 */
export function getDraftParticipantSession(roomId: number) {
  const storage = getSessionStorage();

  if (!storage) {
    return null;
  }

  const storedValue = storage.getItem(createDraftParticipantStorageKey(roomId));

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    return isDraftParticipantSession(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

/** 대기실을 나갈 때 저장된 참가자 세션 삭제 */
export function removeDraftParticipantSession(roomId: number) {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(createDraftParticipantStorageKey(roomId));
}

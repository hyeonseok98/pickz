import type { DraftParticipantSession } from "@/types";

const draftParticipantStorageKeyPrefix = "pickz:draft-participant";

function createDraftParticipantStorageKey(roomId: number) {
  return `${draftParticipantStorageKeyPrefix}:${roomId}`;
}

function getSessionStorage() {
  // sessionStorage는 브라우저에서만 접근 가능함.
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function isDraftParticipantSession(value: unknown): value is DraftParticipantSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const recordValue = value as Record<string, unknown>;

  return (
    typeof recordValue.roomId === "number" &&
    typeof recordValue.inviteCode === "string" &&
    typeof recordValue.participantToken === "string"
  );
}

export function saveDraftParticipantSession(session: DraftParticipantSession) {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.setItem(createDraftParticipantStorageKey(session.roomId), JSON.stringify(session));
}

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

export function removeDraftParticipantSession(roomId: number) {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(createDraftParticipantStorageKey(roomId));
}

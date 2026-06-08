import type { JoinDraftRoomResponse } from "@/types/draft";
import { isJoinDraftRoomResponseValue } from "./draft-invite-room";

const draftInviteSessionStorageKeyPrefix = "pickz:draft-invite-session";

function createDraftInviteSessionStorageKey(inviteCode: string) {
  return `${draftInviteSessionStorageKeyPrefix}:${inviteCode}`;
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

/** 초대 코드로 받은 참가 응답을 sessionStorage에서 조회 */
export function getStoredDraftInviteJoinResponse(inviteCode: string) {
  const storage = getSessionStorage();

  if (!storage) {
    return null;
  }

  try {
    const storedValue = storage.getItem(createDraftInviteSessionStorageKey(inviteCode));

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    return isJoinDraftRoomResponseValue(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

/** 초대 코드로 받은 참가 응답을 새로고침 재사용용으로 저장 */
export function saveDraftInviteJoinResponse(
  inviteCode: string,
  response: JoinDraftRoomResponse,
) {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(createDraftInviteSessionStorageKey(inviteCode), JSON.stringify(response));
  } catch {
    // sessionStorage 저장 실패 시 메모리 중복 방지만 사용
  }
}

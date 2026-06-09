import { createDraftRoom, joinDraftRoomByInviteCode } from "@/apis/draft";
import type {
  CreateDraftRoomRequest,
  CreateDraftRoomResponse,
  JoinDraftRoomResponse,
} from "@/types/draft";
import {
  getStoredDraftInviteJoinResponse,
  saveDraftInviteJoinResponse,
} from "./draft-invite-session-storage";
import { reusePendingRequest } from "./draft-pending-request";

const pendingCreateRoomRequests = new Map<string, Promise<CreateDraftRoomResponse>>();
const pendingJoinRoomRequests = new Map<string, Promise<JoinDraftRoomResponse>>();

/** 같은 방 생성 요청이 동시에 반복될 때 기존 요청 재사용 */
export function createDraftRoomWithPendingRequestCache(request: CreateDraftRoomRequest) {
  return reusePendingRequest({
    cacheKey: JSON.stringify(request),
    pendingRequests: pendingCreateRoomRequests,
    request: () => createDraftRoom(request),
  });
}

/** 같은 초대 코드 입장 요청이 동시에 반복될 때 기존 요청 또는 세션 재사용 */
export function joinDraftRoomByInviteCodeWithPendingRequestCache(inviteCode: string) {
  const storedJoinRoomResponse = getStoredDraftInviteJoinResponse(inviteCode);

  if (storedJoinRoomResponse) {
    return Promise.resolve(storedJoinRoomResponse);
  }

  return reusePendingRequest({
    cacheKey: inviteCode,
    pendingRequests: pendingJoinRoomRequests,
    request: async () => {
      const joinRoomResponse = await joinDraftRoomByInviteCode(inviteCode);

      saveDraftInviteJoinResponse(inviteCode, joinRoomResponse);

      return joinRoomResponse;
    },
  });
}

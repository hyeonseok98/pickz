export interface DraftInviteParticipantItem {
  id: string;
  isHost: boolean;
  nickname: string;
  status: string;
}

export interface DraftInviteRoleSlot {
  id: string;
  teamNumber: number;
}

export type DraftInviteRoomErrorSource =
  | "createRoom"
  | "joinRoom"
  | "session"
  | "stomp"
  | "startDraft"
  | null;

export type DraftInviteRoomStatus =
  | "idle"
  | "creatingRoom"
  | "joiningRoom"
  | "ready"
  | "failed";

export interface DraftParticipantEventPayload {
  newParticipant?: string;
  nicknames: string[];
  totalCount: number;
}

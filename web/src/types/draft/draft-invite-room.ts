export interface DraftInviteParticipantItem {
  id: string;
  isHost: boolean;
  isReady?: boolean;
  nickname: string;
  selectedCoachName?: string;
  status: string;
  turnOrder?: number;
}

export interface DraftInviteRoleSlot {
  coachImageUrl?: string | null;
  coachName: string;
  id: string;
  teamNumber: number;
}

export type DraftInviteRoomErrorSource =
  | "createRoom"
  | "joinRoom"
  | "selectCoach"
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
  participants: DraftInviteParticipantItem[];
  totalCount: number;
}

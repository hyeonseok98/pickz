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

export interface DraftParticipantEventPayload {
  newParticipant?: string;
  nicknames: string[];
  totalCount: number;
}

export interface CreateDraftRoomRequest {
  mode: "TOGETHER";
  ruleName: "SNAKE";
}

export interface CreateDraftRoomResponse {
  roomId: number;
  inviteCode: string;
  participantToken: string;
  isHost?: boolean;
  nickname?: string;
}

export interface DraftParticipantSession {
  roomId: number;
  inviteCode: string;
  nickname?: string;
  participantToken: string;
}

export interface JoinDraftRoomResponse {
  participantToken: string;
  isHost?: boolean;
  nickname?: string;
}

export interface StartDraftRoomRequest {
  teamCount: number;
  teamSize: number;
}

export interface StartDraftRoomParams {
  participantToken: string;
  request: StartDraftRoomRequest;
  roomId: number;
}

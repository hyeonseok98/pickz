export interface CreateDraftRoomRequest {
  mode: "TOGETHER";
  ruleName: "SNAKE";
}

export interface CreateDraftRoomResponse {
  isHost: boolean;
  roomId: number;
  inviteCode: string;
  nickname?: string;
  participantToken: string;
}

export interface DraftParticipantSession {
  inviteCode?: string;
  isHost: boolean;
  nickname?: string;
  participantToken: string;
  roomId: number;
}

export interface JoinDraftRoomResponse {
  isHost: boolean;
  nickname?: string;
  participantToken: string;
  roomId: number;
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

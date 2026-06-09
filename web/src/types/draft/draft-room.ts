export type DraftRoomApiDraftMode = "SNAKE" | "AUCTION";
export type DraftRoomApiParticipationType = "SOLO" | "TOGETHER";
export type DraftRoomApiStatus = "WAITING" | "PLAYING";

export interface DraftRoomApiStreamer {
  name: string;
  imageUrl: string | null;
}

export interface CreateDraftRoomRequest {
  draftMode: DraftRoomApiDraftMode;
  participationType: DraftRoomApiParticipationType;
  preset: string;
  teamCount: number;
  teamSize: number;
  title: string;
}

export interface CreateDraftRoomResponse {
  isHost: boolean;
  roomId: number;
  inviteCode: string;
  nickname?: string;
  participantToken: string;
  selectedCoachName?: string;
  turnOrder?: number;
  isReady?: boolean;
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
  selectedCoachName?: string;
  turnOrder?: number;
  isReady?: boolean;
}

export interface StartDraftRoomParams {
  participantToken: string;
  roomId: number;
}

export interface DraftRoomStreamerPoolResponse {
  adc: DraftRoomApiStreamer[];
  coach: DraftRoomApiStreamer[];
  jug: DraftRoomApiStreamer[];
  mid: DraftRoomApiStreamer[];
  sup: DraftRoomApiStreamer[];
  top: DraftRoomApiStreamer[];
}

export interface DraftRoomStreamerTeamSlotRequest {
  adc: DraftRoomApiStreamer | null;
  coach: DraftRoomApiStreamer | null;
  jug: DraftRoomApiStreamer | null;
  mid: DraftRoomApiStreamer | null;
  sup: DraftRoomApiStreamer | null;
  teamSlot: number;
  top: DraftRoomApiStreamer | null;
}

export interface SaveDraftRoomStreamerPoolParams {
  participantToken: string;
  roomId: number;
  teamStreamerSlots: DraftRoomStreamerTeamSlotRequest[];
}

export interface SelectDraftRoomCoachRequest {
  coachName: string;
  targetTurnOrder: number;
}

export interface SelectDraftRoomCoachParams {
  participantToken: string;
  request: SelectDraftRoomCoachRequest;
  roomId: number;
}

export interface DraftRoomStateCoach {
  nickname: string;
  participantNickname: string;
}

export interface DraftRoomStateStreamerPool {
  adc: DraftRoomApiStreamer[];
  coach: DraftRoomApiStreamer[];
  jungle: DraftRoomApiStreamer[];
  mid: DraftRoomApiStreamer[];
  support: DraftRoomApiStreamer[];
  top: DraftRoomApiStreamer[];
}

export interface DraftRoomStateConfig {
  coaches: DraftRoomStateCoach[];
  pickOrder: string[];
  streamersByLine: DraftRoomStateStreamerPool;
}

export interface DraftRoomStateResponse {
  draftConfig: DraftRoomStateConfig;
  roomId: number;
  roomStatus: DraftRoomApiStatus;
}

export interface DraftRoomParticipantTokenParams {
  participantToken: string;
  roomId: number;
}

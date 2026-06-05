import type { BoardState, LineKey } from "./draft-board";
import type { DraftType, ParticipationMode, RoomVisibility, TeamCount, TeamSize } from "./draft-config";

export interface DraftCreateFlowState {
  board: BoardState;
  draftType: DraftType;
  participantIds: string[];
  participationMode: ParticipationMode;
  password: string;
  roomTitle: string;
  teamCount: TeamCount;
  teamSize: TeamSize;
  tournamentId: string;
  visibility: RoomVisibility;
}

export interface ApplyTournamentSelectionParams {
  board: BoardState;
  participantIds: string[];
  tournamentId: string;
}

export interface InitializeDraftCreateSettingsParams {
  draftType: DraftType;
  participationMode: ParticipationMode;
  roomTitle?: string;
  teamCount: TeamCount;
  teamSize: TeamSize;
  tournamentId: string;
}

export interface MoveDraftParticipantParams {
  index: number;
  line: LineKey;
  streamerId: string;
}

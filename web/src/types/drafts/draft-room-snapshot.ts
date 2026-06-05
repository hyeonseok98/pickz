import type { BoardState } from "./draft-board";
import type {
  DraftType,
  ParticipationMode,
  RoomVisibility,
  TeamCount,
  TeamSize,
} from "./draft-config";

export interface DraftRoomSnapshot {
  board: BoardState;
  draftType: DraftType;
  inviteLink: string;
  joinedParticipantNames: string[];
  membersPerTeam: TeamSize;
  participantIds: string[];
  participationMode: ParticipationMode;
  teamCount: TeamCount;
  tournamentId: string;
  tournamentName: string;
  visibility: RoomVisibility;
}

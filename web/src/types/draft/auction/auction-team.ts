import type { AuctionPlayerLine, AuctionStreamer, AuctionTeamStaff } from "./auction-streamer";

export type AuctionTeamId = number;

export type AuctionRosterAssignmentType = "sold" | "autoAssigned";

export interface AuctionTeamRosterSlot {
  assignmentType: AuctionRosterAssignmentType;
  bidPoint: number;
  streamer: AuctionStreamer;
}

export type AuctionTeamRoster = Partial<Record<AuctionPlayerLine, AuctionTeamRosterSlot>>;

export interface AuctionTeamState {
  remainingPoints: number;
  roster: AuctionTeamRoster;
  staff: AuctionTeamStaff;
  teamId: AuctionTeamId;
  teamName: string;
}

export type AuctionTeamStateMap = Record<string, AuctionTeamState>;

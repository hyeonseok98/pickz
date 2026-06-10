import type { AuctionPlayerLine, AuctionStreamer, AuctionTeamStaff } from "./auction-streamer";

export type AuctionTeamId = number;

export type AuctionTeamRoster = Partial<Record<AuctionPlayerLine, AuctionStreamer>>;

export interface AuctionTeamState {
  remainingPoints: number;
  roster: AuctionTeamRoster;
  staff: AuctionTeamStaff;
  teamId: AuctionTeamId;
  teamName: string;
}

export type AuctionTeamStateMap = Record<string, AuctionTeamState>;

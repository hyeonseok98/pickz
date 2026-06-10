import type { AuctionChatMessage } from "./auction-event";
import type { AuctionPhase } from "./auction-phase";
import type { AuctionStreamer } from "./auction-streamer";
import type { AuctionTeamState } from "./auction-team";

export interface AuctionPageState {
  currentHighestBidAmount: number;
  currentHighestBidTeamName: string;
  currentPhase: AuctionPhase;
  currentStreamer: AuctionStreamer;
  initialTeamPoints: number;
  logs: AuctionChatMessage[];
  remainSeconds: number;
  roomTitle: string;
  teamStates: AuctionTeamState[];
  unbidStreamers: AuctionStreamer[];
  upcomingStreamers: AuctionStreamer[];
}

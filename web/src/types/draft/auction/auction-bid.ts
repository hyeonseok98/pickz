import type { AuctionTeamId } from "./auction-team";

export interface AuctionBidRequest {
  amount: number;
  teamId: AuctionTeamId;
}

export interface AuctionBidValidationParams {
  amount: number;
  currentHighestBidAmount: number;
  remainingPoints: number;
}

export interface AuctionBidValidationResult {
  isValid: boolean;
  message: string | null;
}

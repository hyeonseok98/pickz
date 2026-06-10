export type AuctionPhase =
  | "STANDBY"
  | "COUNTDOWN"
  | "BIDDING"
  | "EVALUATING"
  | "ROUND_RESULT"
  | "FINISHED";

export type AuctionRoundStatus = "SOLD" | "UNBID";

export type AuctionRoundStep =
  | "waitingToStart"
  | "streamerAnnounce"
  | "countdown"
  | "bidding"
  | "evaluating"
  | "roundResult"
  | "finished";

import type { LolLineKey } from "../draft-board";

export type AuctionPlayerLine = Exclude<LolLineKey, "coach" | "headCoach">;
export type AuctionStaffRole = Extract<LolLineKey, "coach" | "headCoach">;

export interface AuctionStreamer {
  id: string;
  line: AuctionPlayerLine;
  name: string;
  profileImageUrl: string | null;
}

export interface AuctionStaffMember {
  id: string;
  name: string;
  profileImageUrl: string | null;
  role: AuctionStaffRole;
}

export interface AuctionTeamStaff {
  coach: AuctionStaffMember | null;
  headCoach: AuctionStaffMember | null;
  teamSlot: number;
}

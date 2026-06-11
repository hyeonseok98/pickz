import type { AuctionPhase, AuctionRoundStatus } from "./auction-phase";
import type { AuctionStreamer } from "./auction-streamer";
import type { AuctionTeamId, AuctionTeamStateMap } from "./auction-team";

/** 경매 화면 전체를 한 번에 동기화할 때 사용하는 서버 payload */
export interface AuctionSyncPayload {
  currentHighestBidAmount: number;
  currentHighestBidTeamId: AuctionTeamId | null;
  currentPhase: AuctionPhase;
  currentStreamer: AuctionStreamer | null;
  isReAuctionPhase: boolean;
  teamStates: AuctionTeamStateMap;
  unbidStreamers: AuctionStreamer[];
  upcomingStreamers: AuctionStreamer[];
}

/** 현재 phase와 남은 시간을 별도로 갱신할 때 사용하는 서버 payload */
export interface AuctionPhasePayload {
  phase: AuctionPhase;
  remainSeconds: number;
}

export interface AuctionRoundPrimaryResult {
  streamerId: string;
  teamId: AuctionTeamId;
  winningBid: number;
}

export interface AuctionAutoAssignedResult {
  bidPoint: number;
  reason: string;
  streamerId: string;
  teamId: AuctionTeamId;
}

/** 한 라운드가 끝났을 때 낙찰 또는 유찰 결과를 전달하는 서버 payload */
export interface AuctionRoundResultPayload {
  autoAssignedResults: AuctionAutoAssignedResult[];
  primaryResult: AuctionRoundPrimaryResult | null;
  roundStatus: AuctionRoundStatus;
}

/** 입찰 로그와 시스템 로그를 같은 리스트로 다루기 위한 화면 메시지 타입 */
export interface AuctionChatMessageSegment {
  text: string;
  tone?:
    | "danger"
    | "muted"
    | "primary"
    | "success"
    | "warning"
    | "lineTop"
    | "lineJungle"
    | "lineMid"
    | "lineAdc"
    | "lineSupport"
    | "teamOne"
    | "teamTwo"
    | "teamThree"
    | "teamFour"
    | "teamFive";
}

export interface AuctionChatMessage {
  id: string;
  message: string;
  segments?: AuctionChatMessageSegment[];
  sentAt: string;
  type: "bid" | "system";
}

/** 경매 종료 시 최종 팀 상태를 전달하는 서버 payload */
export interface AuctionFinishPayload {
  finishedAt: string;
  teamStates: AuctionTeamStateMap;
}

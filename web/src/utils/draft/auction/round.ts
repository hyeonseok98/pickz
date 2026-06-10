import {
  auctionAnnounceCountdownSeconds,
  auctionBiddingSeconds,
  auctionInitialStandbySeconds,
  auctionMaxReauctionCount,
  auctionRoundResultWaitSeconds,
} from "@/constants/draft";
import { draftLineLabelMap } from "@/constants/draft";
import type { AuctionPhase, AuctionPlayerLine, AuctionStreamer } from "@/types/draft/auction";

/** phase별 기본 진행 시간을 반환 */
export function getAuctionPhaseDurationSeconds(phase: AuctionPhase) {
  switch (phase) {
    case "STANDBY":
      return auctionInitialStandbySeconds;
    case "COUNTDOWN":
      return auctionAnnounceCountdownSeconds;
    case "BIDDING":
      return auctionBiddingSeconds;
    case "ROUND_RESULT":
      return auctionRoundResultWaitSeconds;
    case "EVALUATING":
    case "FINISHED":
      return 0;
  }
}

/** 재경매 횟수가 최대 허용치에 도달했는지 확인 */
export function isAuctionReauctionLimitReached(reauctionCount: number) {
  return reauctionCount >= auctionMaxReauctionCount;
}

/** 경매 차례가 시작될 때 로그에 표시할 문구 생성 */
export function createAuctionTurnAnnouncement(streamer: AuctionStreamer) {
  return `${draftLineLabelMap[streamer.line]} ${streamer.name} 경매 차례입니다`;
}

/** 경매 화면에서 사용할 포지션 한글 라벨 반환 */
export function getAuctionLineLabel(line: AuctionPlayerLine) {
  return draftLineLabelMap[line];
}

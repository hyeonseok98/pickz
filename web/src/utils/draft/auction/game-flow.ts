import { auctionInitialTeamPoints } from "@/constants/draft";
import type { AuctionStreamer, AuctionTeamState } from "@/types/draft/auction";
import { addStreamerToAuctionRoster } from "./team";

export interface AuctionHighestBid {
  amount: number;
  teamId: number;
  teamName: string;
}

/** 경매 로그에 표시할 현재 시각 문자열 생성 */
export function createAuctionLogTime() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** 팀 순서와 감독 구성을 유지한 채 경매 결과만 초기화 */
export function resetAuctionTeamStates(teamStates: AuctionTeamState[]) {
  return teamStates.map((teamState) => ({
    ...teamState,
    remainingPoints: auctionInitialTeamPoints,
    roster: {},
  }));
}

/** 낙찰된 선수를 해당 팀 로스터에 반영하고 포인트를 차감 */
export function applyAuctionSoldResult({
  bidAmount,
  streamer,
  teamId,
  teamStates,
}: {
  bidAmount: number;
  streamer: AuctionStreamer;
  teamId: number;
  teamStates: AuctionTeamState[];
}) {
  return teamStates.map((teamState) => {
    if (teamState.teamId !== teamId) {
      return teamState;
    }

    return {
      ...teamState,
      remainingPoints: Math.max(0, teamState.remainingPoints - bidAmount),
      roster: addStreamerToAuctionRoster(teamState.roster, streamer),
    };
  });
}

import {
  auctionInitialTeamPoints,
  pickzInvitational2026AuctionStreamerOrder,
  pickzInvitational2026Name,
  pickzInvitational2026TeamStaffs,
} from "@/constants/draft";
import type {
  AuctionStreamer,
  AuctionTeamState,
  AuctionPageState,
} from "@/types/draft/auction";
import { createInitialAuctionTeamStates, shuffleAuctionStreamers } from "@/utils/draft/auction";

const initialTeamStates = createInitialAuctionTeamStates(pickzInvitational2026TeamStaffs);
const upcomingStreamers = shuffleAuctionStreamers(pickzInvitational2026AuctionStreamerOrder);
const unbidStreamers: AuctionStreamer[] = [];

function createMockAuctionTeamStates() {
  return Object.values(initialTeamStates).map<AuctionTeamState>((teamState, index) => ({
    ...teamState,
    remainingPoints: [870, 1000, 700, 955][index] ?? auctionInitialTeamPoints,
    roster:
      index === 0
        ? {
            mid: pickzInvitational2026AuctionStreamerOrder[8],
          }
        : index === 2
          ? {
              adc: pickzInvitational2026AuctionStreamerOrder[12],
            }
          : {},
  }));
}

export const auctionPageMockState: AuctionPageState = {
  currentHighestBidAmount: 0,
  currentHighestBidTeamName: null,
  currentPhase: "STANDBY",
  currentStreamer: null,
  initialTeamPoints: auctionInitialTeamPoints,
  isSoloMode: true,
  remainSeconds: 13,
  roomTitle: `${pickzInvitational2026Name} 경매 드래프트`,
  teamStates: createMockAuctionTeamStates(),
  unbidStreamers,
  upcomingStreamers,
  logs: [
    {
      id: "log-1",
      message: "게임 시작 버튼 클릭 후 경매가 시작됩니다.",
      sentAt: "20:31",
      type: "system",
    },
  ],
};

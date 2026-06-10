import {
  auctionInitialTeamPoints,
  pickzInvitational2026AuctionStreamerOrder,
  pickzInvitational2026Name,
  pickzInvitational2026TeamStaffs,
} from "@/constants/draft";
import type {
  AuctionChatMessage,
  AuctionPhase,
  AuctionStreamer,
  AuctionTeamState,
  AuctionPageState,
} from "@/types/draft/auction";
import { createInitialAuctionTeamStates } from "@/utils/draft/auction";

const initialTeamStates = createInitialAuctionTeamStates(pickzInvitational2026TeamStaffs);
const currentStreamer = pickzInvitational2026AuctionStreamerOrder[0];
const upcomingStreamers = pickzInvitational2026AuctionStreamerOrder.slice(1, 13);
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
  currentHighestBidAmount: 130,
  currentHighestBidTeamName: "마린 팀",
  currentPhase: "BIDDING",
  currentStreamer,
  initialTeamPoints: auctionInitialTeamPoints,
  remainSeconds: 13,
  roomTitle: `${pickzInvitational2026Name} 경매 드래프트`,
  teamStates: createMockAuctionTeamStates(),
  unbidStreamers,
  upcomingStreamers,
  logs: [
    {
      id: "log-1",
      message: "게임 입장 10초 뒤 경매가 시작됩니다",
      sentAt: "20:31",
      type: "system",
    },
    {
      id: "log-2",
      message: "탑 러너 경매 차례입니다",
      sentAt: "20:41",
      type: "system",
    },
    {
      id: "log-3",
      message: "3초 카운트다운 뒤 경매 시작",
      sentAt: "20:42",
      type: "system",
    },
    {
      id: "log-4",
      message: "마린 팀 - 러너 - 130포인트",
      sentAt: "20:43",
      type: "bid",
    },
  ],
};

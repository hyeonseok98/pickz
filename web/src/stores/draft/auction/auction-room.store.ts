import type {
  AuctionChatMessage,
  AuctionFinishPayload,
  AuctionPhase,
  AuctionPhasePayload,
  AuctionRoundResultPayload,
  AuctionStreamer,
  AuctionSyncPayload,
  AuctionTeamId,
  AuctionTeamStateMap,
} from "@/types/draft/auction";
import { createAuctionTurnAnnouncement } from "@/utils/draft/auction";
import { create } from "zustand";

interface AuctionRoomStoreState {
  bidInputAmount: string;
  currentHighestBidAmount: number;
  currentHighestBidTeamId: AuctionTeamId | null;
  currentPhase: AuctionPhase;
  currentStreamer: AuctionStreamer | null;
  isReauctionPhase: boolean;
  logs: AuctionChatMessage[];
  remainSeconds: number;
  resetAuctionRoom: () => void;
  roomId: number | null;
  setBidInputAmount: (amount: string) => void;
  setRoomId: (roomId: number) => void;
  teamStates: AuctionTeamStateMap;
  unbidStreamers: AuctionStreamer[];
  upcomingStreamers: AuctionStreamer[];
  updateAuctionFinish: (payload: AuctionFinishPayload) => void;
  updateAuctionPhase: (payload: AuctionPhasePayload) => void;
  updateAuctionRoundResult: (payload: AuctionRoundResultPayload) => void;
  updateAuctionSync: (payload: AuctionSyncPayload) => void;
  writeAuctionLog: (message: AuctionChatMessage) => void;
}

/** 웹소켓 연결 전에도 안전하게 사용할 수 있는 기본 경매 화면 상태 */
const initialAuctionRoomState = {
  bidInputAmount: "",
  currentHighestBidAmount: 0,
  currentHighestBidTeamId: null,
  currentPhase: "STANDBY",
  currentStreamer: null,
  isReauctionPhase: false,
  logs: [],
  remainSeconds: 0,
  roomId: null,
  teamStates: {},
  unbidStreamers: [],
  upcomingStreamers: [],
} satisfies Pick<
  AuctionRoomStoreState,
  | "bidInputAmount"
  | "currentHighestBidAmount"
  | "currentHighestBidTeamId"
  | "currentPhase"
  | "currentStreamer"
  | "isReauctionPhase"
  | "logs"
  | "remainSeconds"
  | "roomId"
  | "teamStates"
  | "unbidStreamers"
  | "upcomingStreamers"
>;

/** 서버 이벤트를 받았을 때 화면 로그에 쌓을 시스템 메시지 생성 */
function createSystemLog(message: string): AuctionChatMessage {
  return {
    id: `${Date.now()}-${message}`,
    message,
    sentAt: new Date().toISOString(),
    type: "system",
  };
}

export const useAuctionRoomStore = create<AuctionRoomStoreState>((set) => ({
  ...initialAuctionRoomState,
  resetAuctionRoom: () => {
    set(() => initialAuctionRoomState);
  },
  setBidInputAmount: (amount) => {
    set(() => ({ bidInputAmount: amount }));
  },
  setRoomId: (roomId) => {
    set(() => ({ roomId }));
  },
  updateAuctionFinish: ({ finishedAt, teamStates }) => {
    set((current) => ({
      currentPhase: "FINISHED",
      logs: [
        ...current.logs,
        {
          id: `finish-${finishedAt}`,
          message: "경매가 종료되었습니다",
          sentAt: finishedAt,
          type: "system",
        },
      ],
      teamStates,
    }));
  },
  updateAuctionPhase: ({ phase, remainSeconds }) => {
    set(() => ({
      currentPhase: phase,
      remainSeconds,
    }));
  },
  updateAuctionRoundResult: ({ autoAssignedResults, primaryResult, roundStatus }) => {
    set((current) => ({
      currentPhase: "ROUND_RESULT",
      logs: [
        ...current.logs,
        createSystemLog(
          roundStatus === "SOLD"
            ? `${primaryResult?.winningBid ?? 0}포인트에 낙찰되었습니다`
            : `유찰되었습니다. 자동 배정 ${autoAssignedResults.length}건`,
        ),
      ],
    }));
  },
  updateAuctionSync: (payload) => {
    set((current) => {
      const nextLogs =
        payload.currentStreamer &&
        payload.currentStreamer.id !== current.currentStreamer?.id
          ? [...current.logs, createSystemLog(createAuctionTurnAnnouncement(payload.currentStreamer))]
          : current.logs;

      return {
        currentHighestBidAmount: payload.currentHighestBidAmount,
        currentHighestBidTeamId: payload.currentHighestBidTeamId,
        currentPhase: payload.currentPhase,
        currentStreamer: payload.currentStreamer,
        isReauctionPhase: payload.isReAuctionPhase,
        logs: nextLogs,
        teamStates: payload.teamStates,
        unbidStreamers: payload.unbidStreamers,
        upcomingStreamers: payload.upcomingStreamers,
      };
    });
  },
  writeAuctionLog: (message) => {
    set((current) => ({
      logs: [...current.logs, message],
    }));
  },
}));

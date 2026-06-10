import {
  auctionInitialTeamPoints,
  pickzInvitational2026AuctionStreamerOrder,
  pickzInvitational2026Name,
  pickzInvitational2026TeamStaffs,
  STREAMER_DIRECTORY_BY_ID,
} from "@/constants/draft";
import type {
  AuctionChatMessage,
  AuctionPhase,
  AuctionPlayerLine,
  AuctionStaffMember,
  AuctionStreamer,
  AuctionTeamStaff,
  AuctionTeamState,
} from "@/types/draft/auction";
import type { DraftRoomSnapshot } from "@/types/draft";
import { createInitialAuctionTeamStates } from "@/utils/draft/auction";

export interface AuctionPageMockState {
  currentHighestBidAmount: number;
  currentHighestBidTeamName: string;
  currentPhase: AuctionPhase;
  currentStreamer: AuctionStreamer;
  initialTeamPoints: number;
  remainSeconds: number;
  roomTitle: string;
  teamStates: AuctionTeamState[];
  unbidStreamers: AuctionStreamer[];
  upcomingStreamers: AuctionStreamer[];
  logs: AuctionChatMessage[];
}

const initialTeamStates = createInitialAuctionTeamStates(pickzInvitational2026TeamStaffs);
const currentStreamer = pickzInvitational2026AuctionStreamerOrder[0];
const upcomingStreamers = pickzInvitational2026AuctionStreamerOrder.slice(1, 13);
const unbidStreamers: AuctionStreamer[] = [];

const auctionPlayerLineKeys: AuctionPlayerLine[] = ["top", "jungle", "mid", "adc", "support"];

function createAuctionStreamerFromDirectoryId(
  streamerId: string | null,
  line: AuctionPlayerLine,
): AuctionStreamer | null {
  if (!streamerId) {
    return null;
  }

  const streamer = STREAMER_DIRECTORY_BY_ID.get(streamerId);

  if (!streamer) {
    return null;
  }

  return {
    id: streamer.id,
    line,
    name: streamer.name,
    profileImageUrl: streamer.profileImageUrl,
  };
}

function createAuctionStaffFromDirectoryId(
  streamerId: string | null,
  role: AuctionStaffMember["role"],
): AuctionStaffMember | null {
  if (!streamerId) {
    return null;
  }

  const streamer = STREAMER_DIRECTORY_BY_ID.get(streamerId);

  if (!streamer) {
    return null;
  }

  return {
    id: streamer.id,
    name: streamer.name,
    profileImageUrl: streamer.profileImageUrl,
    role,
  };
}

function createSnapshotTeamStaff(snapshot: DraftRoomSnapshot, teamIndex: number): AuctionTeamStaff {
  return {
    coach: createAuctionStaffFromDirectoryId(snapshot.board.coach[teamIndex] ?? null, "coach"),
    headCoach: createAuctionStaffFromDirectoryId(
      snapshot.board.headCoach[teamIndex] ?? null,
      "headCoach",
    ),
    teamSlot: teamIndex + 1,
  };
}

function createAuctionTeamStateFromSnapshot(
  snapshot: DraftRoomSnapshot,
  teamIndex: number,
): AuctionTeamState {
  const staff = createSnapshotTeamStaff(snapshot, teamIndex);
  const fallbackTeamName = `${teamIndex + 1}팀`;
  const teamName = staff.headCoach?.name
    ? `${staff.headCoach.name} 팀`
    : staff.coach?.name
      ? `${staff.coach.name} 팀`
      : fallbackTeamName;

  return {
    remainingPoints: auctionInitialTeamPoints,
    roster: Object.fromEntries(
      auctionPlayerLineKeys
        .map((line) => [line, createAuctionStreamerFromDirectoryId(snapshot.board[line][teamIndex] ?? null, line)])
        .filter(([, streamer]) => Boolean(streamer)),
    ) as AuctionTeamState["roster"],
    staff,
    teamId: teamIndex + 1,
    teamName,
  };
}

function createAuctionOrderFromSnapshot(snapshot: DraftRoomSnapshot) {
  return auctionPlayerLineKeys.flatMap((line) =>
    snapshot.board[line]
      .slice(0, Number(snapshot.teamCount))
      .map((streamerId) => createAuctionStreamerFromDirectoryId(streamerId, line))
      .filter((streamer): streamer is AuctionStreamer => Boolean(streamer)),
  );
}

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

export const auctionPageMockState: AuctionPageMockState = {
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

export function createAuctionPageStateFromSnapshot(
  snapshot: DraftRoomSnapshot,
): AuctionPageMockState {
  const auctionOrder = createAuctionOrderFromSnapshot(snapshot);
  const nextCurrentStreamer = auctionOrder[0] ?? currentStreamer;

  return {
    ...auctionPageMockState,
    currentStreamer: nextCurrentStreamer,
    roomTitle: `${snapshot.tournamentName} 경매 드래프트`,
    teamStates: Array.from({ length: Number(snapshot.teamCount) }, (_, teamIndex) =>
      createAuctionTeamStateFromSnapshot(snapshot, teamIndex),
    ),
    unbidStreamers: [],
    upcomingStreamers: auctionOrder.slice(1),
  };
}

import {
  auctionInitialTeamPoints,
  pickzInvitational2026Name,
  STREAMER_DIRECTORY_BY_ID,
} from "@/constants/draft";
import type {
  AuctionPageState,
  AuctionPlayerLine,
  AuctionStaffMember,
  AuctionStreamer,
  AuctionTeamStaff,
  AuctionTeamState,
  DraftRoomApiStreamer,
  DraftRoomSnapshot,
  DraftRoomStreamerPoolResponse,
} from "@/types/draft";
import { createAuctionTeamName } from "./team";
import { shuffleAuctionStreamers } from "./order";

const auctionPlayerLineKeys: AuctionPlayerLine[] = ["top", "jungle", "mid", "adc", "support"];

const apiStreamerPoolLineEntries = [
  ["top", "top"],
  ["jug", "jungle"],
  ["mid", "mid"],
  ["adc", "adc"],
  ["sup", "support"],
] satisfies Array<[Exclude<keyof DraftRoomStreamerPoolResponse, "coach">, AuctionPlayerLine]>;

interface CreateAuctionPageStateFromStreamerPoolParams {
  roomTitle?: string;
  streamerPool: DraftRoomStreamerPoolResponse;
  teamCount?: number;
}

function createAuctionStreamerId(line: AuctionPlayerLine, streamerName: string, index: number) {
  return `auction-${line}-${index + 1}-${streamerName}`;
}

function createAuctionStaffId(role: AuctionStaffMember["role"], streamerName: string, index: number) {
  return `auction-${role}-${index + 1}-${streamerName}`;
}

function createAuctionStreamerFromApiStreamer(
  apiStreamer: DraftRoomApiStreamer,
  line: AuctionPlayerLine,
  index: number,
): AuctionStreamer {
  return {
    id: createAuctionStreamerId(line, apiStreamer.name, index),
    line,
    name: apiStreamer.name,
    profileImageUrl: apiStreamer.imageUrl,
  };
}

function createAuctionStaffFromApiStreamer(
  apiStreamer: DraftRoomApiStreamer | undefined,
  index: number,
): AuctionStaffMember | null {
  if (!apiStreamer) {
    return null;
  }

  return {
    id: createAuctionStaffId("coach", apiStreamer.name, index),
    name: apiStreamer.name,
    profileImageUrl: apiStreamer.imageUrl,
    role: "coach",
  };
}

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

function createEmptyAuctionTeamState(staff: AuctionTeamStaff): AuctionTeamState {
  return {
    remainingPoints: auctionInitialTeamPoints,
    roster: {},
    staff,
    teamId: staff.teamSlot,
    teamName: createAuctionTeamName(staff),
  };
}

function createFallbackAuctionTeamStaff(teamSlot: number): AuctionTeamStaff {
  return {
    coach: null,
    headCoach: null,
    teamSlot,
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

function createAuctionOrderFromSnapshot(snapshot: DraftRoomSnapshot) {
  return auctionPlayerLineKeys.flatMap((line) =>
    snapshot.board[line]
      .slice(0, Number(snapshot.teamCount))
      .map((streamerId) => createAuctionStreamerFromDirectoryId(streamerId, line))
      .filter((streamer): streamer is AuctionStreamer => Boolean(streamer)),
  );
}

function createAuctionOrderFromStreamerPool(streamerPool: DraftRoomStreamerPoolResponse) {
  return apiStreamerPoolLineEntries.flatMap(([apiLine, auctionLine]) =>
    streamerPool[apiLine].map((streamer, index) =>
      createAuctionStreamerFromApiStreamer(streamer, auctionLine, index),
    ),
  );
}

function getTeamCountFromStreamerPool(
  streamerPool: DraftRoomStreamerPoolResponse,
  fallbackTeamCount?: number,
) {
  const poolCounts = [
    streamerPool.top.length,
    streamerPool.jug.length,
    streamerPool.mid.length,
    streamerPool.adc.length,
    streamerPool.sup.length,
    streamerPool.coach.length,
  ];

  return Math.max(fallbackTeamCount ?? 0, ...poolCounts, 1);
}

function createInitialAuctionLogs(): AuctionPageState["logs"] {
  return [
    {
      id: "auction-ready-log",
      message: "게임 시작 버튼 클릭 후 경매가 시작됩니다.",
      sentAt: "20:31",
      type: "system",
    },
  ];
}

function createAuctionPageStateBase(
  roomTitle: string,
  auctionOrder: AuctionStreamer[],
  teamStates: AuctionTeamState[],
  isSoloMode: boolean,
): AuctionPageState {
  const shuffledAuctionOrder = shuffleAuctionStreamers(auctionOrder);

  return {
    currentHighestBidAmount: 0,
    currentHighestBidTeamName: null,
    currentPhase: "STANDBY",
    currentStreamer: null,
    initialTeamPoints: auctionInitialTeamPoints,
    isSoloMode,
    logs: createInitialAuctionLogs(),
    remainSeconds: 10,
    roomTitle,
    teamStates,
    unbidStreamers: [],
    upcomingStreamers: shuffledAuctionOrder,
  };
}

/** 혼자하기 URL snapshot을 경매 화면 초기 상태로 변환 */
export function createAuctionPageStateFromSnapshot(snapshot: DraftRoomSnapshot): AuctionPageState {
  const teamStates = Array.from({ length: Number(snapshot.teamCount) }, (_, teamIndex) =>
    createEmptyAuctionTeamState(createSnapshotTeamStaff(snapshot, teamIndex)),
  );

  return createAuctionPageStateBase(
    `${snapshot.tournamentName} 경매 드래프트`,
    createAuctionOrderFromSnapshot(snapshot),
    teamStates,
    snapshot.participationMode === "solo",
  );
}

/** 같이하기 스트리머 풀 API 응답을 경매 화면 초기 상태로 변환 */
export function createAuctionPageStateFromStreamerPool({
  roomTitle = `${pickzInvitational2026Name} 경매 드래프트`,
  streamerPool,
  teamCount,
}: CreateAuctionPageStateFromStreamerPoolParams): AuctionPageState {
  const nextTeamCount = getTeamCountFromStreamerPool(streamerPool, teamCount);
  const teamStates = Array.from({ length: nextTeamCount }, (_, teamIndex) => {
    const staff = {
      ...createFallbackAuctionTeamStaff(teamIndex + 1),
      coach: createAuctionStaffFromApiStreamer(streamerPool.coach[teamIndex], teamIndex),
    };

    return createEmptyAuctionTeamState(staff);
  });

  return createAuctionPageStateBase(
    roomTitle,
    createAuctionOrderFromStreamerPool(streamerPool),
    teamStates,
    false,
  );
}

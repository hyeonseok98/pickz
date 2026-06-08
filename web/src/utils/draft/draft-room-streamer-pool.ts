import { STREAMER_DIRECTORY, STREAMER_DIRECTORY_BY_ID } from "@/constants/draft";
import type {
  BoardState,
  DraftRoomApiStreamer,
  DraftRoomStreamerTeamSlotRequest,
  LolLineKey,
} from "@/types/draft";

const pickzInvitationalFallbackNames = {
  coach: ["엄티", "로컨", "노페", "플라이"],
  headCoach: ["마린", "베릴", "인간젤리", "큐베"],
} satisfies Pick<BoardState, "coach" | "headCoach">;

const streamerPoolLineKeyMap = {
  adc: "adc",
  coach: "coach",
  jug: "jungle",
  mid: "mid",
  sup: "support",
  top: "top",
} satisfies Record<Exclude<keyof DraftRoomStreamerTeamSlotRequest, "teamSlot">, LolLineKey>;

function createFallbackStreamerFromBoardId(streamerId: string): DraftRoomApiStreamer | null {
  const fallbackIdMatch = /^pickz-invitational-(headCoach|coach)-(\d+)$/.exec(streamerId);

  if (!fallbackIdMatch) {
    return null;
  }

  const fallbackLine = fallbackIdMatch[1] as "headCoach" | "coach";
  const fallbackIndex = Number(fallbackIdMatch[2]) - 1;
  const fallbackName = pickzInvitationalFallbackNames[fallbackLine][fallbackIndex];

  return fallbackName ? { imageUrl: "", name: fallbackName } : null;
}

function createStreamerFromDirectoryId(streamerId: string | null): DraftRoomApiStreamer | null {
  if (!streamerId) {
    return null;
  }

  const streamerProfile = STREAMER_DIRECTORY_BY_ID.get(streamerId);

  if (streamerProfile) {
    return {
      imageUrl: streamerProfile.profileImageUrl ?? streamerProfile.avatarDataUrl,
      name: streamerProfile.name,
    };
  }

  return createFallbackStreamerFromBoardId(streamerId);
}

function requireStreamerFromBoardSlot(
  streamerId: string | null,
  lineLabel: string,
  teamSlot: number,
) {
  const draftRoomStreamer = createStreamerFromDirectoryId(streamerId);

  if (!draftRoomStreamer) {
    throw new Error(`${teamSlot + 1}팀 ${lineLabel} 스트리머 정보가 준비되지 않았습니다.`);
  }

  return draftRoomStreamer;
}

function createWsTestStreamer(lineKey: LolLineKey, teamSlot: number): DraftRoomApiStreamer {
  const streamerProfile = STREAMER_DIRECTORY.filter((streamer) => streamer.line === lineKey)[
    teamSlot
  ];

  if (!streamerProfile) {
    return {
      imageUrl: "",
      name: `${lineKey}-${teamSlot + 1}`,
    };
  }

  return {
    imageUrl: streamerProfile.profileImageUrl ?? streamerProfile.avatarDataUrl,
    name: streamerProfile.name,
  };
}

/** 방 생성 후 저장할 라인별 스트리머 배치 요청 목록 생성 */
export function createDraftRoomStreamerTeamSlotsFromBoard(
  board: BoardState,
  teamCount: number,
): DraftRoomStreamerTeamSlotRequest[] {
  return Array.from({ length: teamCount }, (_, teamSlot) => {
    const coachStreamerId = board.headCoach[teamSlot] ?? board.coach[teamSlot];

    return {
      adc: requireStreamerFromBoardSlot(board.adc[teamSlot], "원딜", teamSlot),
      coach: requireStreamerFromBoardSlot(coachStreamerId, "감독", teamSlot),
      jug: requireStreamerFromBoardSlot(board.jungle[teamSlot], "정글", teamSlot),
      mid: requireStreamerFromBoardSlot(board.mid[teamSlot], "미드", teamSlot),
      sup: requireStreamerFromBoardSlot(board.support[teamSlot], "서폿", teamSlot),
      teamSlot,
      top: requireStreamerFromBoardSlot(board.top[teamSlot], "탑", teamSlot),
    };
  });
}

/** WebSocket 테스트 화면에서 쓸 기본 스트리머 배치 요청 목록 생성 */
export function createDraftRoomStreamerTeamSlotsForTest(
  teamCount: number,
): DraftRoomStreamerTeamSlotRequest[] {
  return Array.from({ length: teamCount }, (_, teamSlot) => ({
    adc: createWsTestStreamer(streamerPoolLineKeyMap.adc, teamSlot),
    coach: createWsTestStreamer(streamerPoolLineKeyMap.coach, teamSlot),
    jug: createWsTestStreamer(streamerPoolLineKeyMap.jug, teamSlot),
    mid: createWsTestStreamer(streamerPoolLineKeyMap.mid, teamSlot),
    sup: createWsTestStreamer(streamerPoolLineKeyMap.sup, teamSlot),
    teamSlot,
    top: createWsTestStreamer(streamerPoolLineKeyMap.top, teamSlot),
  }));
}

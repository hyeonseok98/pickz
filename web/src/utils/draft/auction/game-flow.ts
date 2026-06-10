import { auctionInitialTeamPoints } from "@/constants/draft";
import type { AuctionPlayerLine, AuctionStreamer, AuctionTeamState } from "@/types/draft/auction";
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
      roster: addStreamerToAuctionRoster(teamState.roster, streamer, {
        assignmentType: "sold",
        bidPoint: bidAmount,
      }),
    };
  });
}

/** 해당 선수 라인이 비어 있는 팀 중 무작위 배정 대상 팀 선택 */
export function getRandomAuctionAssignableTeam(
  teamStates: AuctionTeamState[],
  streamer: AuctionStreamer,
) {
  const assignableTeams = teamStates.filter((teamState) => !teamState.roster[streamer.line]);

  if (assignableTeams.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * assignableTeams.length);

  return assignableTeams[randomIndex] ?? null;
}

/** 재경매 한도를 넘긴 선수를 빈 라인 슬롯이 있는 팀에 자동 배정 */
export function applyAuctionAutoAssignedResult({
  streamer,
  teamId,
  teamStates,
}: {
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
      roster: addStreamerToAuctionRoster(teamState.roster, streamer, {
        assignmentType: "autoAssigned",
        bidPoint: 0,
      }),
    };
  });
}

export interface AuctionForcedAssignment {
  streamer: AuctionStreamer;
  team: AuctionTeamState;
}

export interface ResolveAuctionForcedAssignmentsResult {
  assignments: AuctionForcedAssignment[];
  queue: AuctionStreamer[];
  teamStates: AuctionTeamState[];
  unbidStreamers: AuctionStreamer[];
}

const auctionPlayerLineOrder: AuctionPlayerLine[] = ["top", "jungle", "mid", "adc", "support"];

function shuffleAuctionItems<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [nextItems[randomIndex], nextItems[index]];
  }

  return nextItems;
}

function removeAssignedStreamers(
  streamers: AuctionStreamer[],
  assignedStreamerIds: Set<string>,
) {
  return streamers.filter((streamer) => !assignedStreamerIds.has(streamer.id));
}

function getUniqueAuctionStreamers(streamers: AuctionStreamer[]) {
  const seenStreamerIds = new Set<string>();

  return streamers.filter((streamer) => {
    if (seenStreamerIds.has(streamer.id)) {
      return false;
    }

    seenStreamerIds.add(streamer.id);
    return true;
  });
}

/** 특정 라인에 남은 선수와 빈 팀 슬롯이 각각 1개면 0포인트 자동 배정 */
export function resolveAuctionForcedAssignments({
  queue,
  teamStates,
  unbidStreamers,
}: {
  queue: AuctionStreamer[];
  teamStates: AuctionTeamState[];
  unbidStreamers: AuctionStreamer[];
}): ResolveAuctionForcedAssignmentsResult {
  let nextTeamStates = teamStates;
  const assignments: AuctionForcedAssignment[] = [];
  const assignedStreamerIds = new Set<string>();
  const candidates = getUniqueAuctionStreamers([...queue, ...unbidStreamers]);

  auctionPlayerLineOrder.forEach((line) => {
    const lineStreamers = candidates.filter(
      (streamer) => streamer.line === line && !assignedStreamerIds.has(streamer.id),
    );
    const assignableTeams = nextTeamStates.filter((teamState) => !teamState.roster[line]);

    if (lineStreamers.length !== 1 || assignableTeams.length !== 1) {
      return;
    }

    const shuffledTeams = shuffleAuctionItems(assignableTeams);

    lineStreamers.forEach((streamer, index) => {
      const team = shuffledTeams[index];

      if (!team) {
        return;
      }

      nextTeamStates = applyAuctionAutoAssignedResult({
        streamer,
        teamId: team.teamId,
        teamStates: nextTeamStates,
      });
      assignments.push({ streamer, team });
      assignedStreamerIds.add(streamer.id);
    });
  });

  return {
    assignments,
    queue: removeAssignedStreamers(queue, assignedStreamerIds),
    teamStates: nextTeamStates,
    unbidStreamers: removeAssignedStreamers(unbidStreamers, assignedStreamerIds),
  };
}

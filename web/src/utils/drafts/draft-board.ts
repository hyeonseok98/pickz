import { draftLineRows, maxTeamCount } from "@/constants/drafts";
import type { BoardState, TeamCount, TeamSize } from "@/types/drafts";

interface DraftLineOptions {
  coachEnabled?: boolean;
  headCoachEnabled?: boolean;
}

export function createEmptyDraftBoard(): BoardState {
  return {
    top: Array.from({ length: maxTeamCount }, () => null),
    jungle: Array.from({ length: maxTeamCount }, () => null),
    mid: Array.from({ length: maxTeamCount }, () => null),
    adc: Array.from({ length: maxTeamCount }, () => null),
    support: Array.from({ length: maxTeamCount }, () => null),
    headCoach: Array.from({ length: maxTeamCount }, () => null),
    coach: Array.from({ length: maxTeamCount }, () => null),
  };
}

export function cloneDraftBoard(board: BoardState): BoardState {
  return {
    top: [...board.top],
    jungle: [...board.jungle],
    mid: [...board.mid],
    adc: [...board.adc],
    support: [...board.support],
    headCoach: [...board.headCoach],
    coach: [...board.coach],
  };
}

export function getActiveDraftLines(teamSize: TeamSize, options?: DraftLineOptions) {
  const baseLineCount = Math.min(Number(teamSize), 5);
  const activeLines = [...draftLineRows.slice(0, baseLineCount)];
  const inferredHeadCoachEnabled = teamSize === "7";
  const inferredCoachEnabled = teamSize === "6" || teamSize === "7";
  const headCoachEnabled = options?.headCoachEnabled ?? inferredHeadCoachEnabled;
  const coachEnabled = options?.coachEnabled ?? inferredCoachEnabled;

  if (headCoachEnabled) {
    activeLines.push(draftLineRows.find((line) => line.key === "headCoach")!);
  }

  if (coachEnabled) {
    activeLines.push(draftLineRows.find((line) => line.key === "coach")!);
  }

  return activeLines;
}

export function deriveDraftCreateBooleans(teamSize: TeamSize) {
  return {
    coachEnabled: teamSize === "6" || teamSize === "7",
    headCoachEnabled: teamSize === "7",
  };
}

export function normalizeDraftBoard(
  board: BoardState,
  teamCount: TeamCount,
  teamSize: TeamSize,
  options?: DraftLineOptions,
): BoardState {
  const nextBoard = createEmptyDraftBoard();
  const activeLineKeys = getActiveDraftLines(teamSize, options).map((line) => line.key);
  const columnCount = Number(teamCount);

  draftLineRows.forEach(({ key }) => {
    nextBoard[key] = nextBoard[key].map((_, index) =>
      activeLineKeys.includes(key) && index < columnCount ? board[key][index] : null,
    );
  });

  return nextBoard;
}

export function getPlacedDraftStreamerIds(board: BoardState) {
  const ids: string[] = [];

  draftLineRows.forEach(({ key }) => {
    board[key].forEach((streamerId) => {
      if (streamerId && !ids.includes(streamerId)) {
        ids.push(streamerId);
      }
    });
  });

  return ids;
}

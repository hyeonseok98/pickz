import { draftLineRows, maxTeamCount } from "@/constants/drafts";
import type { BoardState, TeamCount, TeamSize } from "@/types/drafts";

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

export function getActiveDraftLines(teamSize: TeamSize) {
  return draftLineRows.slice(0, Number(teamSize));
}

export function normalizeDraftBoard(
  board: BoardState,
  teamCount: TeamCount,
  teamSize: TeamSize,
): BoardState {
  const nextBoard = createEmptyDraftBoard();
  const activeLineKeys = getActiveDraftLines(teamSize).map((line) => line.key);
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

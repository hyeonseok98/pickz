import { draftLineRows, maxTeamCount } from "@/constants/draft";
import type { BoardState, TeamCount, TeamSize } from "@/types/draft";

interface DraftLineOptions {
  coachEnabled?: boolean;
  headCoachEnabled?: boolean;
}

/** 스트리머 설정 화면에서 쓸 빈 보드 상태 생성 */
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

/** 드래그 배치 변경 전 기존 보드 상태 복사 */
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

/** 팀당 인원과 감독 설정에 맞는 활성 라인 목록 계산 */
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

/** 팀당 인원 값에서 감독과 코치 기본 활성 상태 계산 */
export function deriveDraftCreateBooleans(teamSize: TeamSize) {
  return {
    coachEnabled: teamSize === "6" || teamSize === "7",
    headCoachEnabled: teamSize === "7",
  };
}

/** 현재 방 설정에 포함되지 않는 보드 슬롯 제거 */
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

/** 이미 보드에 배치된 스트리머 id 목록 추출 */
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

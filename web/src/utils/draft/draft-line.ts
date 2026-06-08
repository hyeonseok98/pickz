import { draftLineOrderMap } from "@/constants/draft";
import type { LolLineKey } from "@/types/draft";

interface DraftLineSortable {
  line: LolLineKey;
}

/** 라인 표시 순서 정렬을 위한 우선순위 비교 */
export function compareDraftLineOrder(leftLine: LolLineKey, rightLine: LolLineKey) {
  return draftLineOrderMap[leftLine] - draftLineOrderMap[rightLine];
}

/** 스트리머 목록을 탑부터 서폿 순서로 정렬 */
export function sortByDraftLineOrder<T extends DraftLineSortable>(items: T[]) {
  return [...items].sort((left, right) => {
    const lineOrderDiff = compareDraftLineOrder(left.line, right.line);

    if (lineOrderDiff !== 0) {
      return lineOrderDiff;
    }

    return 0;
  });
}

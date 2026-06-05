import { draftLineOrderMap } from "@/constants/drafts";
import type { LineKey } from "@/types/drafts";

interface DraftLineSortable {
  line: LineKey;
}

export function compareDraftLineOrder(leftLine: LineKey, rightLine: LineKey) {
  return draftLineOrderMap[leftLine] - draftLineOrderMap[rightLine];
}

export function sortByDraftLineOrder<T extends DraftLineSortable>(items: T[]) {
  return [...items].sort((left, right) => {
    const lineOrderDiff = compareDraftLineOrder(left.line, right.line);

    if (lineOrderDiff !== 0) {
      return lineOrderDiff;
    }

    return 0;
  });
}

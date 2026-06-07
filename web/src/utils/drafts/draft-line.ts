import { draftLineOrderMap } from "@/constants/drafts";
import type { LolLineKey } from "@/types/drafts";

interface DraftLineSortable {
  line: LolLineKey;
}

export function compareDraftLineOrder(leftLine: LolLineKey, rightLine: LolLineKey) {
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

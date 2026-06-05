import type { LineKey } from "@/types/drafts";

export interface DraftLineDefinition {
  key: LineKey;
  label: string;
}

export const draftLineRows: DraftLineDefinition[] = [
  { key: "top", label: "탑" },
  { key: "jungle", label: "정글" },
  { key: "mid", label: "미드" },
  { key: "adc", label: "원딜" },
  { key: "support", label: "서폿" },
  { key: "headCoach", label: "감독" },
  { key: "coach", label: "코치" },
];

export const draftLineOrder: LineKey[] = ["top", "jungle", "mid", "adc", "support", "headCoach", "coach"];

export const draftLineOrderMap: Record<LineKey, number> = {
  top: 0,
  jungle: 1,
  mid: 2,
  adc: 3,
  support: 4,
  headCoach: 5,
  coach: 6,
};

export const draftLineLabelMap: Record<LineKey, string> = {
  top: "탑",
  jungle: "정글",
  mid: "미드",
  adc: "원딜",
  support: "서폿",
  headCoach: "감독",
  coach: "코치",
};

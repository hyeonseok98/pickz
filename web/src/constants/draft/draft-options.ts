import type { DraftType, ParticipationMode, TeamCount, TeamSize } from "@/types/draft";

export const draftTypeLabelMap: Record<DraftType, string> = {
  auction: "경매",
  snake: "스네이크 드래프트",
};

export const participationModeLabelMap: Record<ParticipationMode, string> = {
  party: "같이하기",
  solo: "혼자하기",
};

export const teamCountOptions: TeamCount[] = ["2", "3", "4", "5"];
export const teamSizeOptions: TeamSize[] = ["3", "4", "5", "6", "7"];

export const maxTeamCount = Number(teamCountOptions[teamCountOptions.length - 1]);

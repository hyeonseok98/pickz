export type DraftType = "snake" | "auction";
export type ParticipationMode = "solo" | "party";
export type RoomVisibility = "public" | "private";
export type TeamCount = "2" | "3" | "4" | "5";
export type TeamSize = "3" | "4" | "5";
export type LineKey = "top" | "jungle" | "mid" | "adc" | "support";
export type BoardState = Record<LineKey, Array<string | null>>;

export interface DraftRoomSnapshot {
  board: BoardState;
  draftType: DraftType;
  inviteLink: string;
  joinedParticipantNames: string[];
  membersPerTeam: TeamSize;
  participantIds: string[];
  participationMode: ParticipationMode;
  teamCount: TeamCount;
  tournamentId: string;
  tournamentName: string;
  visibility: RoomVisibility;
}

export const draftLineRows: Array<{ key: LineKey; label: string }> = [
  { key: "top", label: "탑" },
  { key: "jungle", label: "정글" },
  { key: "mid", label: "미드" },
  { key: "adc", label: "원딜" },
  { key: "support", label: "서폿" },
];

export const draftLineLabelMap: Record<LineKey, string> = {
  adc: "원딜",
  jungle: "정글",
  mid: "미드",
  support: "서폿",
  top: "탑",
};

export const draftTypeLabelMap: Record<DraftType, string> = {
  auction: "경매 드래프트",
  snake: "스네이크 드래프트",
};

export const participationModeLabelMap: Record<ParticipationMode, string> = {
  party: "같이하기",
  solo: "혼자하기",
};

const validDraftTypes = new Set<DraftType>(["snake", "auction"]);
const validParticipationModes = new Set<ParticipationMode>(["solo", "party"]);
const validRoomVisibility = new Set<RoomVisibility>(["public", "private"]);
const validTeamCounts = new Set<TeamCount>(["2", "3", "4", "5"]);
const validTeamSizes = new Set<TeamSize>(["3", "4", "5"]);

function isNullableStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => item === null || typeof item === "string");
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isBoardState(value: unknown): value is BoardState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const recordValue = value as Record<string, unknown>;

  return draftLineRows.every(
    ({ key }) => isNullableStringArray(recordValue[key]) && (recordValue[key] as unknown[]).length === 5,
  );
}

export function getActiveDraftLines(teamSize: TeamSize) {
  return draftLineRows.slice(0, Number(teamSize));
}

export function serializeDraftRoomSnapshot(snapshot: DraftRoomSnapshot) {
  return encodeURIComponent(JSON.stringify(snapshot));
}

export function parseDraftRoomSnapshot(encodedSnapshot: string | null): DraftRoomSnapshot | null {
  if (!encodedSnapshot) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(decodeURIComponent(encodedSnapshot)) as Partial<DraftRoomSnapshot>;

    if (
      !parsedValue ||
      typeof parsedValue !== "object" ||
      !isBoardState(parsedValue.board) ||
      !validDraftTypes.has(parsedValue.draftType as DraftType) ||
      !validParticipationModes.has(parsedValue.participationMode as ParticipationMode) ||
      !validRoomVisibility.has(parsedValue.visibility as RoomVisibility) ||
      !validTeamCounts.has(parsedValue.teamCount as TeamCount) ||
      !validTeamSizes.has(parsedValue.membersPerTeam as TeamSize) ||
      typeof parsedValue.tournamentId !== "string" ||
      typeof parsedValue.tournamentName !== "string" ||
      typeof parsedValue.inviteLink !== "string" ||
      !isStringArray(parsedValue.participantIds) ||
      !isStringArray(parsedValue.joinedParticipantNames)
    ) {
      return null;
    }

    return parsedValue as DraftRoomSnapshot;
  } catch {
    return null;
  }
}

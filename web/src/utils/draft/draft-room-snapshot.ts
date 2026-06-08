import { draftLineRows, maxTeamCount } from "@/constants/draft";
import type {
  BoardState,
  DraftRoomSnapshot,
  DraftType,
  ParticipationMode,
  RoomVisibility,
  TeamCount,
  TeamSize,
} from "@/types/draft";

const validDraftTypes: DraftType[] = ["snake", "auction"];
const validParticipationModes: ParticipationMode[] = ["solo", "party"];
const validRoomVisibility: RoomVisibility[] = ["public", "private"];
const validTeamCounts: TeamCount[] = ["2", "3", "4", "5"];
const validTeamSizes: TeamSize[] = ["3", "4", "5", "6", "7"];

function isIncludedString<T extends string>(validValues: T[], value: unknown): value is T {
  return typeof value === "string" && validValues.some((validValue) => validValue === value);
}

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
    ({ key }) =>
      isNullableStringArray(recordValue[key]) && (recordValue[key] as unknown[]).length === maxTeamCount,
  );
}

function isDraftRoomSnapshot(value: unknown): value is DraftRoomSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const recordValue = value as Record<string, unknown>;

  return (
    isBoardState(recordValue.board) &&
    typeof recordValue.coachEnabled === "boolean" &&
    isIncludedString(validDraftTypes, recordValue.draftType) &&
    typeof recordValue.headCoachEnabled === "boolean" &&
    isIncludedString(validParticipationModes, recordValue.participationMode) &&
    isIncludedString(validRoomVisibility, recordValue.visibility) &&
    isIncludedString(validTeamCounts, recordValue.teamCount) &&
    isIncludedString(validTeamSizes, recordValue.membersPerTeam) &&
    typeof recordValue.tournamentId === "string" &&
    typeof recordValue.tournamentName === "string" &&
    typeof recordValue.inviteLink === "string" &&
    isStringArray(recordValue.participantIds) &&
    isStringArray(recordValue.joinedParticipantNames)
  );
}

export function serializeDraftRoomSnapshot(snapshot: DraftRoomSnapshot) {
  return JSON.stringify(snapshot);
}

export function parseDraftRoomSnapshot(encodedSnapshot: string | null): DraftRoomSnapshot | null {
  if (!encodedSnapshot) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(encodedSnapshot) as unknown;

    return isDraftRoomSnapshot(parsedValue) ? parsedValue : null;
  } catch {
    try {
      const parsedValue = JSON.parse(decodeURIComponent(encodedSnapshot)) as unknown;

      return isDraftRoomSnapshot(parsedValue) ? parsedValue : null;
    } catch {
      return null;
    }
  }
}

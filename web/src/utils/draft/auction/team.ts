import { auctionInitialTeamPoints } from "@/constants/draft";
import type {
  AuctionRosterAssignmentType,
  AuctionStreamer,
  AuctionTeamRoster,
  AuctionTeamStaff,
  AuctionTeamState,
  AuctionTeamStateMap,
} from "@/types/draft/auction";

export function createAuctionTeamName(staff: AuctionTeamStaff) {
  if (staff.headCoach) {
    const coachLabel = staff.coach ? `(코치: ${staff.coach.name})` : "";

    return `${staff.headCoach.name} 팀${coachLabel}`;
  }

  if (staff.coach) {
    return `${staff.coach.name} 팀`;
  }

  return `${staff.teamSlot}팀`;
}

export function createInitialAuctionTeamStates(teamStaffs: AuctionTeamStaff[]) {
  return teamStaffs.reduce<AuctionTeamStateMap>((teamStates, staff) => {
    const teamId = staff.teamSlot;

    teamStates[String(teamId)] = {
      remainingPoints: auctionInitialTeamPoints,
      roster: {},
      staff,
      teamId,
      teamName: createAuctionTeamName(staff),
    };

    return teamStates;
  }, {});
}

export function addStreamerToAuctionRoster(
  roster: AuctionTeamRoster,
  streamer: AuctionStreamer,
  options: {
    assignmentType: AuctionRosterAssignmentType;
    bidPoint: number;
  },
) {
  return {
    ...roster,
    [streamer.line]: {
      assignmentType: options.assignmentType,
      bidPoint: options.bidPoint,
      streamer,
    },
  };
}

export function replaceAuctionTeamState(
  teamStates: AuctionTeamStateMap,
  nextTeamState: AuctionTeamState,
) {
  return {
    ...teamStates,
    [String(nextTeamState.teamId)]: nextTeamState,
  };
}

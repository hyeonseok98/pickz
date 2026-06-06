import { create } from "zustand";
import { draftLineRows } from "@/constants/drafts";
import { cloneDraftBoard, createEmptyDraftBoard, deriveDraftCreateBooleans, normalizeDraftBoard } from "@/utils";
import type {
  ApplyTournamentSelectionParams,
  DraftCreateFlowState,
  InitializeDraftCreateSettingsParams,
  LineKey,
  MoveDraftParticipantParams,
  TeamCount,
  TeamSize,
} from "@/types/drafts";

interface DraftCreateStoreState extends DraftCreateFlowState {
  addParticipant: (streamerId: string) => void;
  applyTournamentSelection: (params: ApplyTournamentSelectionParams) => void;
  clearBoard: () => void;
  clearBoardSlot: (line: LineKey, index: number) => void;
  initializeSettings: (params: InitializeDraftCreateSettingsParams) => void;
  initializeStreamers: (state: DraftCreateFlowState) => void;
  isInitialized: boolean;
  placeParticipant: (params: MoveDraftParticipantParams) => void;
  removeParticipant: (streamerId: string) => void;
  resetDraftCreate: () => void;
  setCoachEnabled: (coachEnabled: boolean) => void;
  setDraftType: (draftType: DraftCreateFlowState["draftType"]) => void;
  setHeadCoachEnabled: (headCoachEnabled: boolean) => void;
  setParticipationMode: (participationMode: DraftCreateFlowState["participationMode"]) => void;
  setPassword: (password: string) => void;
  setRoomTitle: (roomTitle: string) => void;
  setTeamCount: (teamCount: TeamCount) => void;
  setTeamSize: (teamSize: TeamSize) => void;
  setTournamentId: (tournamentId: string) => void;
  setVisibility: (visibility: DraftCreateFlowState["visibility"]) => void;
}

const initialDraftCreateState: DraftCreateFlowState = {
  board: createEmptyDraftBoard(),
  coachEnabled: true,
  draftType: "snake",
  headCoachEnabled: true,
  participantIds: [],
  participationMode: "solo",
  password: "",
  roomTitle: "",
  teamCount: "4",
  teamSize: "7",
  tournamentId: "pickz-invitational",
  visibility: "public",
};

function deriveTeamSizeFromCoachFlags({
  coachEnabled,
  headCoachEnabled,
}: {
  coachEnabled: boolean;
  headCoachEnabled: boolean;
}): TeamSize {
  const enabledExtraLineCount = Number(coachEnabled) + Number(headCoachEnabled);

  if (enabledExtraLineCount === 2) {
    return "7";
  }

  if (enabledExtraLineCount === 1) {
    return "6";
  }

  return "5";
}

function removeParticipantFromBoard(board: DraftCreateFlowState["board"], streamerId: string) {
  const nextBoard = cloneDraftBoard(board);

  draftLineRows.forEach(({ key }) => {
    nextBoard[key] = nextBoard[key].map((value) => (value === streamerId ? null : value));
  });

  return nextBoard;
}

export const useDraftCreateStore = create<DraftCreateStoreState>((set) => ({
  ...initialDraftCreateState,
  addParticipant: (streamerId) => {
    set((current) => {
      if (current.participantIds.includes(streamerId)) {
        return current;
      }

      return {
        participantIds: [...current.participantIds, streamerId],
      };
    });
  },
  applyTournamentSelection: ({ board, coachEnabled, headCoachEnabled, participantIds, tournamentId }) => {
    set(() => ({
      board,
      coachEnabled,
      headCoachEnabled,
      participantIds,
      tournamentId,
    }));
  },
  clearBoard: () => {
    set(() => ({
      board: createEmptyDraftBoard(),
    }));
  },
  clearBoardSlot: (line, index) => {
    set((current) => {
      const nextBoard = cloneDraftBoard(current.board);
      nextBoard[line][index] = null;

      return {
        board: nextBoard,
      };
    });
  },
  initializeSettings: ({ coachEnabled, draftType, headCoachEnabled, participationMode, roomTitle = "", teamCount, teamSize, tournamentId }) => {
    const inferredBooleans = deriveDraftCreateBooleans(teamSize);

    set((current) => ({
      ...current,
      coachEnabled: coachEnabled ?? inferredBooleans.coachEnabled,
      draftType,
      headCoachEnabled: headCoachEnabled ?? inferredBooleans.headCoachEnabled,
      isInitialized: true,
      participationMode,
      roomTitle,
      teamCount,
      teamSize,
      tournamentId,
    }));
  },
  initializeStreamers: (state) => {
    set(() => ({
      ...state,
      isInitialized: true,
    }));
  },
  isInitialized: false,
  placeParticipant: ({ index, line, streamerId }) => {
    set((current) => {
      if (!current.participantIds.includes(streamerId)) {
        return current;
      }

      const nextBoard = removeParticipantFromBoard(current.board, streamerId);
      nextBoard[line][index] = streamerId;

      return {
        board: nextBoard,
      };
    });
  },
  removeParticipant: (streamerId) => {
    set((current) => ({
      board: removeParticipantFromBoard(current.board, streamerId),
      participantIds: current.participantIds.filter((participantId) => participantId !== streamerId),
    }));
  },
  resetDraftCreate: () => {
    set(() => ({
      ...initialDraftCreateState,
      isInitialized: false,
    }));
  },
  setCoachEnabled: (coachEnabled) => {
    set((current) => {
      const nextTeamSize = deriveTeamSizeFromCoachFlags({
        coachEnabled,
        headCoachEnabled: current.headCoachEnabled,
      });

      return {
        board: normalizeDraftBoard(current.board, current.teamCount, nextTeamSize, {
          coachEnabled,
          headCoachEnabled: current.headCoachEnabled,
        }),
        coachEnabled,
        teamSize: nextTeamSize,
      };
    });
  },
  setDraftType: (draftType) => {
    set(() => ({
      draftType,
    }));
  },
  setHeadCoachEnabled: (headCoachEnabled) => {
    set((current) => {
      const nextTeamSize = deriveTeamSizeFromCoachFlags({
        coachEnabled: current.coachEnabled,
        headCoachEnabled,
      });

      return {
        board: normalizeDraftBoard(current.board, current.teamCount, nextTeamSize, {
          coachEnabled: current.coachEnabled,
          headCoachEnabled,
        }),
        headCoachEnabled,
        teamSize: nextTeamSize,
      };
    });
  },
  setParticipationMode: (participationMode) => {
    set(() => ({
      participationMode,
    }));
  },
  setPassword: (password) => {
    set(() => ({
      password,
    }));
  },
  setRoomTitle: (roomTitle) => {
    set(() => ({
      roomTitle,
    }));
  },
  setTeamCount: (teamCount) => {
    set((current) => ({
      board: normalizeDraftBoard(current.board, teamCount, current.teamSize, {
        coachEnabled: current.coachEnabled,
        headCoachEnabled: current.headCoachEnabled,
      }),
      teamCount,
    }));
  },
  setTeamSize: (teamSize) => {
    set((current) => {
      const { coachEnabled, headCoachEnabled } = deriveDraftCreateBooleans(teamSize);

      return {
        board: normalizeDraftBoard(current.board, current.teamCount, teamSize, {
          coachEnabled,
          headCoachEnabled,
        }),
        coachEnabled,
        headCoachEnabled,
        teamSize,
      };
    });
  },
  setTournamentId: (tournamentId) => {
    set(() => ({
      tournamentId,
    }));
  },
  setVisibility: (visibility) => {
    set(() => ({
      visibility,
    }));
  },
}));

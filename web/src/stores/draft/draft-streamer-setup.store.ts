import { draftLineRows } from "@/constants/draft";
import type {
  ApplyTournamentSelectionParams,
  BoardState,
  DraftCreateFlowState,
  LolLineKey,
  MoveDraftParticipantParams,
  TeamCount,
  TeamSize,
} from "@/types/draft";
import {
  cloneDraftBoard,
  createEmptyDraftBoard,
  normalizeDraftBoard,
} from "@/utils";
import { create } from "zustand";

interface DraftStreamerSetupStoreState {
  addParticipant: (streamerId: string) => void;
  applyTournamentStreamerSetup: (params: ApplyTournamentSelectionParams) => void;
  board: BoardState;
  clearBoard: () => void;
  clearBoardSlot: (line: LolLineKey, index: number) => void;
  coachEnabled: boolean;
  headCoachEnabled: boolean;
  initializeStreamerSetup: (state: Pick<
    DraftCreateFlowState,
    "board" | "coachEnabled" | "headCoachEnabled" | "participantIds" | "tournamentId"
  >) => void;
  isStreamerSetupInitialized: boolean;
  participantIds: string[];
  placeParticipant: (params: MoveDraftParticipantParams) => void;
  removeParticipant: (streamerId: string) => void;
  resetStreamerSetup: () => void;
  setCoachEnabled: (params: DraftStreamerStaffToggleParams) => void;
  setHeadCoachEnabled: (params: DraftStreamerStaffToggleParams) => void;
  tournamentId: string;
}

interface DraftStreamerStaffToggleParams {
  enabled: boolean;
  teamCount: TeamCount;
  teamSize: TeamSize;
}

const initialDraftStreamerSetupState = {
  board: createEmptyDraftBoard(),
  coachEnabled: true,
  headCoachEnabled: true,
  isStreamerSetupInitialized: false,
  participantIds: [],
  tournamentId: "pickz-invitational",
} satisfies Pick<
  DraftStreamerSetupStoreState,
  | "board"
  | "coachEnabled"
  | "headCoachEnabled"
  | "isStreamerSetupInitialized"
  | "participantIds"
  | "tournamentId"
>;

function removeStreamerFromBoard(board: BoardState, streamerId: string) {
  const nextBoard = cloneDraftBoard(board);

  draftLineRows.forEach(({ key }) => {
    nextBoard[key] = nextBoard[key].map((value) => (value === streamerId ? null : value));
  });

  return nextBoard;
}

export const useDraftStreamerSetupStore = create<DraftStreamerSetupStoreState>((set) => ({
  ...initialDraftStreamerSetupState,
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
  applyTournamentStreamerSetup: ({
    board,
    coachEnabled,
    headCoachEnabled,
    participantIds,
    tournamentId,
  }) => {
    set(() => ({
      board,
      coachEnabled,
      headCoachEnabled,
      isStreamerSetupInitialized: true,
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
  initializeStreamerSetup: ({
    board,
    coachEnabled,
    headCoachEnabled,
    participantIds,
    tournamentId,
  }) => {
    set(() => ({
      board,
      coachEnabled,
      headCoachEnabled,
      isStreamerSetupInitialized: true,
      participantIds,
      tournamentId,
    }));
  },
  placeParticipant: ({ index, line, streamerId }) => {
    set((current) => {
      if (!current.participantIds.includes(streamerId)) {
        return current;
      }

      const nextBoard = removeStreamerFromBoard(current.board, streamerId);
      nextBoard[line][index] = streamerId;

      return {
        board: nextBoard,
      };
    });
  },
  removeParticipant: (streamerId) => {
    set((current) => ({
      board: removeStreamerFromBoard(current.board, streamerId),
      participantIds: current.participantIds.filter(
        (participantId) => participantId !== streamerId,
      ),
    }));
  },
  resetStreamerSetup: () => {
    set(() => initialDraftStreamerSetupState);
  },
  setCoachEnabled: ({ enabled, teamCount, teamSize }) => {
    set((current) => ({
      board: normalizeDraftBoard(current.board, teamCount, teamSize, {
        coachEnabled: enabled,
        headCoachEnabled: current.headCoachEnabled,
      }),
      coachEnabled: enabled,
    }));
  },
  setHeadCoachEnabled: ({ enabled, teamCount, teamSize }) => {
    set((current) => ({
      board: normalizeDraftBoard(current.board, teamCount, teamSize, {
        coachEnabled: current.coachEnabled,
        headCoachEnabled: enabled,
      }),
      headCoachEnabled: enabled,
    }));
  },
}));

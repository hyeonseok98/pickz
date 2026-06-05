import { create } from "zustand";
import { draftLineRows } from "@/constants/drafts";
import { cloneDraftBoard, createEmptyDraftBoard, normalizeDraftBoard } from "@/utils";
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
  setDraftType: (draftType: DraftCreateFlowState["draftType"]) => void;
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
  draftType: "snake",
  participantIds: [],
  participationMode: "solo",
  password: "",
  roomTitle: "",
  teamCount: "5",
  teamSize: "5",
  tournamentId: "pickz-invitational",
  visibility: "public",
};

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
  applyTournamentSelection: ({ board, participantIds, tournamentId }) => {
    set(() => ({
      board,
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
  initializeSettings: ({ draftType, participationMode, roomTitle = "", teamCount, teamSize, tournamentId }) => {
    set((current) => ({
      ...current,
      draftType,
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
  setDraftType: (draftType) => {
    set(() => ({
      draftType,
    }));
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
      board: normalizeDraftBoard(current.board, teamCount, current.teamSize),
      teamCount,
    }));
  },
  setTeamSize: (teamSize) => {
    set((current) => ({
      board: normalizeDraftBoard(current.board, current.teamCount, teamSize),
      teamSize,
    }));
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

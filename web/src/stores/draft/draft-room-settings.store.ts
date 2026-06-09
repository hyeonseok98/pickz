import type {
  DraftType,
  InitializeDraftCreateSettingsParams,
  ParticipationMode,
  RoomVisibility,
  TeamCount,
  TeamSize,
} from "@/types/draft";
import { create } from "zustand";

interface DraftRoomSettingsStoreState {
  draftType: DraftType;
  initializeRoomSettings: (params: InitializeDraftCreateSettingsParams) => void;
  isSettingsInitialized: boolean;
  participationMode: ParticipationMode;
  password: string;
  resetRoomSettings: () => void;
  roomTitle: string;
  setDraftType: (draftType: DraftType) => void;
  setParticipationMode: (participationMode: ParticipationMode) => void;
  setPassword: (password: string) => void;
  setRoomTitle: (roomTitle: string) => void;
  setTeamCount: (teamCount: TeamCount) => void;
  setTeamSize: (teamSize: TeamSize) => void;
  setTournamentId: (tournamentId: string) => void;
  setVisibility: (visibility: RoomVisibility) => void;
  teamCount: TeamCount;
  teamSize: TeamSize;
  tournamentId: string;
  visibility: RoomVisibility;
}

const initialDraftRoomSettingsState = {
  draftType: "snake",
  isSettingsInitialized: false,
  participationMode: "solo",
  password: "",
  roomTitle: "",
  teamCount: "4",
  teamSize: "7",
  tournamentId: "pickz-invitational",
  visibility: "public",
} satisfies Pick<
  DraftRoomSettingsStoreState,
  | "draftType"
  | "isSettingsInitialized"
  | "participationMode"
  | "password"
  | "roomTitle"
  | "teamCount"
  | "teamSize"
  | "tournamentId"
  | "visibility"
>;

export const useDraftRoomSettingsStore = create<DraftRoomSettingsStoreState>((set) => ({
  ...initialDraftRoomSettingsState,
  initializeRoomSettings: ({
    draftType,
    participationMode,
    roomTitle = "",
    teamCount,
    teamSize,
    tournamentId,
  }) => {
    set(() => ({
      draftType,
      isSettingsInitialized: true,
      participationMode,
      roomTitle,
      teamCount,
      teamSize,
      tournamentId,
    }));
  },
  resetRoomSettings: () => {
    set(() => initialDraftRoomSettingsState);
  },
  setDraftType: (draftType) => {
    set(() => ({ draftType }));
  },
  setParticipationMode: (participationMode) => {
    set(() => ({ participationMode }));
  },
  setPassword: (password) => {
    set(() => ({ password }));
  },
  setRoomTitle: (roomTitle) => {
    set(() => ({ roomTitle }));
  },
  setTeamCount: (teamCount) => {
    set(() => ({ teamCount }));
  },
  setTeamSize: (teamSize) => {
    set(() => ({ teamSize }));
  },
  setTournamentId: (tournamentId) => {
    set(() => ({ tournamentId }));
  },
  setVisibility: (visibility) => {
    set(() => ({ visibility }));
  },
}));

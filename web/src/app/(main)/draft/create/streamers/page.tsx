"use client";

import {
  DraftStepper,
  DraftStreamerBoardSection,
  DraftStreamerSearchSection,
} from "@/components/draft/create";
import { StatusChip } from "@/components/draft/create/streamers/draft-streamer-setup-primitives";
import {
  STREAMER_DIRECTORY,
  STREAMER_DIRECTORY_BY_ID,
  STREAMER_DIRECTORY_BY_NAME,
  draftLineLabelMap,
  draftLineRows,
} from "@/constants/draft";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useDraftRoomSettingsStore, useDraftStreamerSetupStore } from "@/stores/draft";
import type {
  BoardState,
  DraftCreateFlowState,
  DraftType,
  LolLineKey,
  ParticipationMode,
  StreamerDirectoryItem,
  TeamCount,
  TeamSize,
} from "@/types/draft";
import {
  compareDraftLineOrder,
  createEmptyDraftBoard,
  deriveDraftCreateBooleans,
  getActiveDraftLines,
  getPlacedDraftStreamerIds,
  matchesStreamerSearchQuery,
  normalizeDraftBoard,
  parseDraftRoomSnapshot,
  serializeDraftRoomSnapshot,
} from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

interface Streamer {
  avatarDataUrl: string;
  channelName: string;
  id: string;
  line: LolLineKey;
  name: string;
  note?: string;
  profileImageUrl?: string | null;
}

interface Tournament {
  description: string;
  id: string;
  name: string;
  roster: Streamer[];
}

const leaveMessage = "이 페이지를 나가면 작성 중이던 내용이 사라집니다. 이동할까요?";

const customTournamentId = "custom";
const presetStreamerAliasMap: Partial<Record<LolLineKey, Record<string, string>>> = {
  adc: {
    캬하하: "캬하하 이석현",
  },
  coach: {
    플라이: "Fly",
  },
  headCoach: {
    베릴: "BeryL",
    큐베: "큐베 CuVee",
  },
  jungle: {
    갱맘: "갱맘 GBM",
  },
};

const presetFallbackAvatarDataUrl =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%20viewBox%3D%220%200%2096%2096%22%3E%3Crect%20width%3D%2296%22%20height%3D%2296%22%20rx%3D%2248%22%20fill%3D%22%23f1ecff%22/%3E%3Ccircle%20cx%3D%2248%22%20cy%3D%2234%22%20r%3D%2218%22%20fill%3D%22%237c3aed%22%20fill-opacity%3D%220.16%22/%3E%3Cpath%20d%3D%22M22%2078c5-14%2015-22%2026-22s21%208%2026%2022%22%20fill%3D%22%237c3aed%22%20fill-opacity%3D%220.22%22/%3E%3C/svg%3E";

function createTournament(
  id: string,
  name: string,
  description: string,
  rosterByLine: Partial<Record<LolLineKey, string[]>>,
): Tournament {
  return {
    description,
    id,
    name,
    roster: draftLineRows.flatMap(({ key }) =>
      (rosterByLine[key] ?? []).reduce<Streamer[]>((accumulator, streamerName, index) => {
        const resolvedStreamerName = presetStreamerAliasMap[key]?.[streamerName] ?? streamerName;
        const streamerProfile = STREAMER_DIRECTORY_BY_NAME.get(resolvedStreamerName);

        if (!streamerProfile) {
          const fallbackStreamerId = `${id}-${key}-${index + 1}`;

          accumulator.push({
            avatarDataUrl: presetFallbackAvatarDataUrl,
            channelName: streamerName,
            id: fallbackStreamerId,
            line: key,
            name: streamerName,
            note: `${draftLineLabelMap[key]} 추천 슬롯 ${index + 1}`,
            profileImageUrl: null,
          });

          return accumulator;
        }

        accumulator.push({
          avatarDataUrl: streamerProfile.avatarDataUrl,
          channelName: streamerProfile.channelName,
          id: streamerProfile.id,
          line: key,
          name: streamerName,
          note: `${draftLineLabelMap[key]} 추천 슬롯 ${index + 1}`,
          profileImageUrl: streamerProfile.profileImageUrl,
        });

        return accumulator;
      }, []),
    ),
  };
}

const tournaments = [
  createTournament("lck-2025-spring", "LCK 2025 Spring", "2025 스프링 기준 라인별 주전 풀", {
    top: ["Zeus", "Kingen", "Doran", "Morgan", "DuDu"],
    jungle: ["Canyon", "Oner", "Peanut", "Lucid", "Cuzz"],
    mid: ["Faker", "Chovy", "ShowMaker", "Bdd", "Clozer"],
    adc: ["Deft", "Viper", "Gumayusi", "Aiming", "Jiwoo"],
    support: ["Keria", "Delight", "BeryL", "Lehends", "Andil"],
  }),
  createTournament("msi-showcase", "MSI Showcase", "국제전 밸런스 기준으로 구성한 자동 배치 풀", {
    top: ["Bin", "369", "Zeus", "Kiin", "Photon"],
    jungle: ["Wei", "Xun", "Oner", "Tarzan", "Kanavi"],
    mid: ["Knight", "Scout", "Faker", "Caps", "Zeka"],
    adc: ["Ruler", "Elk", "GALA", "Noah", "Aiming"],
    support: ["Missing", "ON", "Keria", "Mikyx", "Life"],
  }),
  createTournament(
    "pickz-invitational",
    "2026 자낳대",
    "2026 자낳대 기준 기본 20인과 감독-코치 세트 자동 배치 프리셋",
    {
      top: ["러너", "룩삼", "강소연", "샘웨"],
      jungle: ["갱맘", "소우릎", "뱅", "운타라"],
      mid: ["플레임", "앰비션", "헤징", "네클릿"],
      adc: ["고수달", "크캣", "캬하하", "순당무"],
      support: ["던", "푸린", "윤가놈", "침착맨"],
      headCoach: ["마린", "베릴", "인간젤리", "큐베"],
      coach: ["엄티", "로컨", "노페", "플라이"],
    },
  ),
] satisfies Tournament[];

const customTournament: Tournament = {
  description: "직접 참여 스트리머를 검색해 라인에 배치하는 사용자 설정 모드",
  id: customTournamentId,
  name: "사용자 설정",
  roster: STREAMER_DIRECTORY.map((streamer) => ({
    avatarDataUrl: streamer.avatarDataUrl,
    channelName: streamer.channelName,
    id: streamer.id,
    line: streamer.line,
    name: streamer.name,
    note: `${draftLineLabelMap[streamer.line]} 직접 배치`,
    profileImageUrl: streamer.profileImageUrl,
  })),
};

const tournamentOptions = [customTournament, ...tournaments] satisfies Tournament[];
const tournamentMap = new Map(tournamentOptions.map((tournament) => [tournament.id, tournament]));

function createAutoBoard(
  tournament: Tournament,
  teamCount: TeamCount,
  teamSize: TeamSize,
  {
    coachEnabled,
    headCoachEnabled,
  }: {
    coachEnabled: boolean;
    headCoachEnabled: boolean;
  },
): BoardState {
  const nextBoard = createEmptyDraftBoard();
  const activeLines = getActiveDraftLines(teamSize, { coachEnabled, headCoachEnabled });
  const columnCount = Number(teamCount);

  activeLines.forEach(({ key }) => {
    const lineRoster = tournament.roster
      .filter((streamer) => streamer.line === key)
      .slice(0, columnCount);

    lineRoster.forEach((streamer, index) => {
      nextBoard[key][index] = streamer.id;
    });
  });

  return nextBoard;
}

function createCustomAutoBoard({
  coachEnabled,
  headCoachEnabled,
  participantIds,
  streamerMap,
  teamCount,
  teamSize,
}: {
  coachEnabled: boolean;
  headCoachEnabled: boolean;
  participantIds: string[];
  streamerMap: Map<string, StreamerDirectoryItem>;
  teamCount: TeamCount;
  teamSize: TeamSize;
}) {
  const nextBoard = createEmptyDraftBoard();
  const activeLines = getActiveDraftLines(teamSize, { coachEnabled, headCoachEnabled });
  const columnCount = Number(teamCount);
  const placedParticipantIdSet = new Set<string>();

  for (const { key } of activeLines) {
    const lineStreamerIds = participantIds.filter(
      (participantId) =>
        !placedParticipantIdSet.has(participantId) && streamerMap.get(participantId)?.line === key,
    );

    lineStreamerIds.slice(0, columnCount).forEach((streamerId, index) => {
      nextBoard[key][index] = streamerId;
      placedParticipantIdSet.add(streamerId);
    });
  }

  const remainingParticipantIds = participantIds.filter(
    (participantId) => !placedParticipantIdSet.has(participantId),
  );
  let remainingParticipantIndex = 0;

  for (const { key } of activeLines) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      if (nextBoard[key][columnIndex] !== null) {
        continue;
      }

      const nextStreamerId = remainingParticipantIds[remainingParticipantIndex];

      if (!nextStreamerId) {
        break;
      }

      nextBoard[key][columnIndex] = nextStreamerId;
      remainingParticipantIndex += 1;
    }
  }

  return nextBoard;
}

function sanitizeDraftType(value: string | null): DraftType {
  return value === "auction" ? "auction" : "snake";
}

function sanitizeParticipationMode(value: string | null): ParticipationMode {
  return value === "party" ? "party" : "solo";
}

function sanitizeTournamentId(value: string | null): string {
  if (value && tournamentMap.has(value)) {
    return value;
  }

  return customTournamentId;
}

function sanitizeTeamCount(value: string | null): TeamCount {
  return value === "2" || value === "3" || value === "4" || value === "5" ? value : "4";
}

function sanitizeTeamSize(value: string | null): TeamSize {
  return value === "3" || value === "4" || value === "5" || value === "6" || value === "7"
    ? value
    : "7";
}

function sanitizeBooleanFlag(value: string | null) {
  return value === "true";
}

function createInitialDraftCreateFlowState({
  coachEnabled,
  draftType,
  headCoachEnabled,
  participationMode,
  teamCount,
  teamSize,
  tournamentId,
}: {
  coachEnabled: boolean;
  draftType: DraftType;
  headCoachEnabled: boolean;
  participationMode: ParticipationMode;
  teamCount: TeamCount;
  teamSize: TeamSize;
  tournamentId: string;
}): DraftCreateFlowState {
  const tournament = tournamentMap.get(tournamentId) ?? customTournament;
  const board =
    tournament.id === customTournamentId
      ? createEmptyDraftBoard()
      : createAutoBoard(tournament, teamCount, teamSize, { coachEnabled, headCoachEnabled });
  const participantIds =
    tournament.id === customTournamentId ? [] : getPlacedDraftStreamerIds(board);

  return {
    board,
    coachEnabled,
    draftType,
    headCoachEnabled,
    participantIds,
    participationMode,
    password: "",
    roomTitle: "",
    teamCount,
    teamSize,
    tournamentId: tournament.id,
    visibility: "public",
  };
}

function createDraftCreateFlowStateFromSnapshot(snapshot: {
  board: BoardState;
  coachEnabled: boolean;
  draftType: DraftType;
  headCoachEnabled: boolean;
  membersPerTeam: TeamSize;
  participantIds: string[];
  participationMode: ParticipationMode;
  teamCount: TeamCount;
  tournamentId: string;
  visibility: DraftCreateFlowState["visibility"];
}): DraftCreateFlowState {
  return {
    board: snapshot.board,
    coachEnabled: snapshot.coachEnabled,
    draftType: snapshot.draftType,
    headCoachEnabled: snapshot.headCoachEnabled,
    participantIds: snapshot.participantIds,
    participationMode: snapshot.participationMode,
    password: "",
    roomTitle: "",
    teamCount: snapshot.teamCount,
    teamSize: snapshot.membersPerTeam,
    tournamentId: snapshot.tournamentId,
    visibility: snapshot.visibility,
  };
}

function ArrowLeftIcon() {
  return (
    <Image
      src="/icons/arrow_back.svg"
      alt=""
      width={16}
      height={16}
      aria-hidden
      className="size-4"
    />
  );
}

function DraftStreamerSetupContent() {
  const router = useRouter();
  const {
    draftType,
    participationMode,
    setTeamSize,
    teamCount,
    teamSize,
    tournamentId,
    visibility,
  } = useDraftRoomSettingsStore();
  const {
    addParticipant: addParticipantToDraft,
    applyTournamentStreamerSetup,
    board,
    coachEnabled,
    clearBoard,
    clearBoardSlot,
    headCoachEnabled,
    participantIds,
    placeParticipant,
    removeParticipant: removeParticipantFromDraft,
    setCoachEnabled: setStreamerCoachEnabled,
    setHeadCoachEnabled: setStreamerHeadCoachEnabled,
  } = useDraftStreamerSetupStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingStreamerId, setDraggingStreamerId] = useState<string | null>(null);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(-1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [initialSnapshotJson] = useState(() =>
    JSON.stringify({
      board,
      coachEnabled,
      draftType,
      headCoachEnabled,
      participantIds,
      participationMode,
      password: "",
      roomTitle: "",
      teamCount,
      teamSize,
      tournamentId,
      visibility,
    }),
  );
  const [selectedStreamerId, setSelectedStreamerId] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ index: number; line: LolLineKey } | null>(null);
  const searchFieldRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isPartyMode = participationMode === "party";
  const currentTournament = tournamentMap.get(tournamentId) ?? customTournament;
  const activeLineRows = useMemo(
    () => getActiveDraftLines(teamSize, { coachEnabled, headCoachEnabled }),
    [coachEnabled, headCoachEnabled, teamSize],
  );
  const visibleColumnCount = Number(teamCount);
  const streamerMap = useMemo(() => {
    const nextStreamerMap = new Map(STREAMER_DIRECTORY_BY_ID);

    currentTournament.roster.forEach((streamer) => {
      if (nextStreamerMap.has(streamer.id)) {
        return;
      }

      nextStreamerMap.set(streamer.id, {
        avatarDataUrl: streamer.avatarDataUrl,
        channelId: streamer.id,
        channelName: streamer.channelName,
        id: streamer.id,
        line: streamer.line,
        name: streamer.name,
        profileImageUrl: streamer.profileImageUrl ?? null,
        streamerInfo: {
          channelId: streamer.id,
          channelName: streamer.channelName,
          followerCount: 0,
          id: streamer.id,
          profileImageUrl: streamer.profileImageUrl ?? null,
          streamerName: streamer.name,
        },
      });
    });

    return nextStreamerMap;
  }, [currentTournament]);

  const placedIds = useMemo(() => getPlacedDraftStreamerIds(board), [board]);

  const placedCount = placedIds.length;
  const requiredPlayerCount = Number(teamCount) * Number(teamSize);

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return STREAMER_DIRECTORY.filter((streamer) =>
      normalizedQuery.length === 0
        ? true
        : matchesStreamerSearchQuery([streamer.name, streamer.channelName], normalizedQuery),
    )
      .map((streamer) => ({
        ...streamer,
        isParticipant: participantIds.includes(streamer.id),
        isPlaced: placedIds.includes(streamer.id),
      }))
      .sort((left, right) => {
        const leftPriority = left.isParticipant ? 1 : 0;
        const rightPriority = right.isParticipant ? 1 : 0;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        const lineOrderDiff = compareDraftLineOrder(left.line, right.line);

        if (lineOrderDiff !== 0) {
          return lineOrderDiff;
        }

        return left.name.localeCompare(right.name);
      })
      .slice(0, 8);
  }, [participantIds, placedIds, searchQuery]);

  const participantStreamers = useMemo(
    () =>
      participantIds
        .map((participantId) => streamerMap.get(participantId))
        .filter((streamer): streamer is NonNullable<typeof streamer> => Boolean(streamer)),
    [participantIds, streamerMap],
  );

  const filteredStreamers = useMemo(() => {
    return participantStreamers
      .filter((streamer) => !placedIds.includes(streamer.id))
      .sort((left, right) => {
        const lineOrderDiff = compareDraftLineOrder(left.line, right.line);

        if (lineOrderDiff !== 0) {
          return lineOrderDiff;
        }

        return left.name.localeCompare(right.name);
      });
  }, [participantStreamers, placedIds]);
  const showSearchDropdown = isSearchDropdownOpen && searchQuery.trim().length > 0;
  const activeSearchIndex =
    highlightedSearchIndex < 0
      ? -1
      : Math.min(highlightedSearchIndex, Math.max(searchResults.length - 1, 0));

  const isDirty = useMemo(
    () =>
      JSON.stringify({
        board,
        coachEnabled,
        draftType,
        headCoachEnabled,
        participantIds,
        participationMode,
        password: "",
        roomTitle: "",
        teamCount,
        teamSize,
        tournamentId,
        visibility,
      }) !== initialSnapshotJson,
    [
      board,
      coachEnabled,
      draftType,
      headCoachEnabled,
      initialSnapshotJson,
      participantIds,
      participationMode,
      teamCount,
      teamSize,
      tournamentId,
      visibility,
    ],
  );
  const canCreateRoom = placedCount >= requiredPlayerCount;

  const closeSearchDropdown = () => {
    setIsSearchDropdownOpen(false);
    setHighlightedSearchIndex(-1);
  };

  useUnsavedChangesGuard(isDirty, leaveMessage);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);

      if (!mediaQuery.matches) {
        setSelectedStreamerId(null);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !searchFieldRef.current?.contains(event.target)) {
        closeSearchDropdown();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const addParticipant = (streamerId: string) => {
    addParticipantToDraft(streamerId);
    setSearchQuery("");
    setHighlightedSearchIndex(-1);
    setIsSearchDropdownOpen(false);
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const removeParticipant = (streamerId: string) => {
    removeParticipantFromDraft(streamerId);

    if (draggingStreamerId === streamerId) {
      setDraggingStreamerId(null);
    }

    if (selectedStreamerId === streamerId) {
      setSelectedStreamerId(null);
    }
  };

  const runAutoPlacement = ({
    nextCoachEnabled = coachEnabled,
    nextHeadCoachEnabled = headCoachEnabled,
    nextTeamSize = teamSize,
    nextTournamentId = tournamentId,
  }: {
    nextCoachEnabled?: boolean;
    nextHeadCoachEnabled?: boolean;
    nextTeamSize?: TeamSize;
    nextTournamentId?: string;
  }) => {
    const tournament = tournamentMap.get(nextTournamentId) ?? customTournament;
    const board =
      tournament.id === customTournamentId
        ? createCustomAutoBoard({
            coachEnabled: nextCoachEnabled,
            headCoachEnabled: nextHeadCoachEnabled,
            participantIds,
            streamerMap,
            teamCount,
            teamSize: nextTeamSize,
          })
        : createAutoBoard(tournament, teamCount, nextTeamSize, {
            coachEnabled: nextCoachEnabled,
            headCoachEnabled: nextHeadCoachEnabled,
          });
    const nextParticipantIds =
      tournament.id === customTournamentId ? participantIds : getPlacedDraftStreamerIds(board);

    applyTournamentStreamerSetup({
      board,
      coachEnabled: nextCoachEnabled,
      headCoachEnabled: nextHeadCoachEnabled,
      participantIds: nextParticipantIds,
      tournamentId: tournament.id,
    });
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const clearAllSlots = () => {
    clearBoard();
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const clearSlot = (line: LolLineKey, index: number) => {
    clearBoardSlot(line, index);
  };

  const canPlaceStreamerOnBoard = (streamerId: string) => {
    return participantIds.includes(streamerId) && streamerMap.has(streamerId);
  };

  const placeStreamerIntoSlot = (streamerId: string, line: LolLineKey, index: number) => {
    if (!canPlaceStreamerOnBoard(streamerId)) {
      return;
    }

    placeParticipant({ index, line, streamerId });
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const handleChipDragStart = (event: DragEvent<HTMLDivElement>, streamerId: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", streamerId);
    setDraggingStreamerId(streamerId);
  };

  const handleChipDragEnd = () => {
    setDraggingStreamerId(null);
    setHoveredSlot(null);
  };

  const handleChipSelect = (streamerId: string) => {
    if (!isMobileViewport) {
      return;
    }

    setSelectedStreamerId((current) => (current === streamerId ? null : streamerId));
  };

  const renderSearchResultStatus = (isParticipant: boolean, isPlaced: boolean) => {
    if (isPlaced) {
      return (
        <StatusChip className="border-text-primary bg-text-primary text-text-inverse">
          배치됨
        </StatusChip>
      );
    }

    if (isParticipant) {
      return (
        <StatusChip className="border-violet-300 bg-violet-100 text-violet-700">추가됨</StatusChip>
      );
    }

    return (
      <StatusChip className="border-border bg-surface text-text-secondary">추가 가능</StatusChip>
    );
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) {
      if (event.key === "Escape") {
        closeSearchDropdown();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedSearchIndex((current) =>
        current < 0 || current >= searchResults.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedSearchIndex((current) =>
        current < 0 || current <= 0 ? searchResults.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      const targetStreamer =
        activeSearchIndex >= 0 ? searchResults[activeSearchIndex] : searchResults[0];

      if (!targetStreamer || targetStreamer.isParticipant) {
        return;
      }

      event.preventDefault();
      addParticipant(targetStreamer.id);

      return;
    }

    if (event.key === "Escape") {
      closeSearchDropdown();
    }
  };

  const handleSlotDragEnter = (
    event: DragEvent<HTMLDivElement>,
    line: LolLineKey,
    index: number,
  ) => {
    const streamerId = draggingStreamerId ?? event.dataTransfer.getData("text/plain");

    if (!streamerId || !canPlaceStreamerOnBoard(streamerId)) {
      return;
    }

    event.preventDefault();
    setHoveredSlot({ index, line });
  };

  const handleSlotDragOver = (
    event: DragEvent<HTMLDivElement>,
    line: LolLineKey,
    index: number,
  ) => {
    const streamerId = draggingStreamerId ?? event.dataTransfer.getData("text/plain");

    if (!streamerId || !canPlaceStreamerOnBoard(streamerId)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setHoveredSlot({ index, line });
  };

  const handleSlotDragLeave = (line: LolLineKey, index: number) => {
    if (hoveredSlot?.line === line && hoveredSlot.index === index) {
      setHoveredSlot(null);
    }
  };

  const handleSlotDrop = (event: DragEvent<HTMLDivElement>, line: LolLineKey, index: number) => {
    const streamerId = draggingStreamerId ?? event.dataTransfer.getData("text/plain");

    if (!streamerId) {
      return;
    }

    event.preventDefault();
    placeStreamerIntoSlot(streamerId, line, index);
  };

  const handleSlotTap = (line: LolLineKey, index: number) => {
    if (!isMobileViewport || !selectedStreamerId) {
      return;
    }

    placeStreamerIntoSlot(selectedStreamerId, line, index);
  };

  const handleHeadCoachSlotToggle = () => {
    const nextHeadCoachEnabled = !headCoachEnabled;
    const nextCoachEnabled = coachEnabled;
    const nextTeamSize =
      nextHeadCoachEnabled && nextCoachEnabled
        ? "7"
        : nextHeadCoachEnabled || nextCoachEnabled
          ? "6"
          : "5";

    setStreamerHeadCoachEnabled({
      enabled: nextHeadCoachEnabled,
      teamCount,
      teamSize: nextTeamSize,
    });
    if (nextTeamSize !== teamSize) {
      setTeamSize(nextTeamSize);
    }
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);

    if (tournamentId !== customTournamentId) {
      runAutoPlacement({
        nextCoachEnabled,
        nextHeadCoachEnabled,
        nextTeamSize,
      });
    }
  };

  const handleCoachSlotToggle = () => {
    const nextCoachEnabled = !coachEnabled;
    const nextHeadCoachEnabled = headCoachEnabled;
    const nextTeamSize =
      nextHeadCoachEnabled && nextCoachEnabled
        ? "7"
        : nextHeadCoachEnabled || nextCoachEnabled
          ? "6"
          : "5";

    setStreamerCoachEnabled({
      enabled: nextCoachEnabled,
      teamCount,
      teamSize: nextTeamSize,
    });
    if (nextTeamSize !== teamSize) {
      setTeamSize(nextTeamSize);
    }
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);

    if (tournamentId !== customTournamentId) {
      runAutoPlacement({
        nextCoachEnabled,
        nextHeadCoachEnabled,
        nextTeamSize,
      });
    }
  };

  const handleCreateRoom = () => {
    if (!canCreateRoom) {
      return;
    }

    const encodedSnapshot = serializeDraftRoomSnapshot({
      board: normalizeDraftBoard(board, teamCount, teamSize, {
        coachEnabled,
        headCoachEnabled,
      }),
      coachEnabled,
      draftType,
      headCoachEnabled,
      inviteLink: "",
      joinedParticipantNames: [],
      membersPerTeam: teamSize,
      participantIds,
      participationMode,
      teamCount,
      tournamentId: currentTournament.id,
      tournamentName: currentTournament.name,
      visibility,
    });

    const nextParams = new URLSearchParams({
      config: encodedSnapshot,
      draftType,
      mode: participationMode,
      teamCount,
      teamSize,
    });

    if (headCoachEnabled) {
      nextParams.set("headCoachEnabled", "true");
    }

    if (coachEnabled) {
      nextParams.set("coachEnabled", "true");
    }

    if (isPartyMode) {
      router.push(`/draft/create/invite?${nextParams.toString()}`);
      return;
    }

    router.push(`/draft/snake?${nextParams.toString()}`);
  };

  return (
    <main className="min-h-full bg-background px-4 py-3 sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3">
        <section className="rounded-3xl border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-4">
          <Link
            href={`/draft/create?draftType=${draftType}&mode=${participationMode}&teamCount=${teamCount}&teamSize=${teamSize}&tournament=${tournamentId}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeftIcon />
            <span>방 설정</span>
          </Link>

          <DraftStepper currentStep="streamers" mode={participationMode} />

          <div className="mt-3">
            <div className="max-w-4xl">
              <h1 className="text-[1.7rem] font-bold tracking-[-0.04em] text-text-primary sm:text-[1.9rem]">
                참가 스트리머 설정
              </h1>
              <p className="mt-2 text-sm leading-5 text-text-secondary">
                함께 드래프트에 참여할 스트리머를 추가하고, 팀과 포지션에 맞춰 배치해 주세요.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-11">
          <DraftStreamerSearchSection
            activeSearchIndex={activeSearchIndex}
            draggingStreamerId={draggingStreamerId}
            filteredStreamers={filteredStreamers}
            isMobileViewport={isMobileViewport}
            onAddParticipant={addParticipant}
            onClearSearchQuery={() => {
              setSearchQuery("");
              setHighlightedSearchIndex(-1);
              setIsSearchDropdownOpen(false);
              searchInputRef.current?.focus();
            }}
            onHighlightedSearchIndexChange={setHighlightedSearchIndex}
            onParticipantDragEnd={handleChipDragEnd}
            onParticipantDragStart={handleChipDragStart}
            onParticipantRemove={removeParticipant}
            onParticipantSelect={handleChipSelect}
            onSearchFocus={() => {
              if (searchQuery.trim().length > 0) {
                setIsSearchDropdownOpen(true);
              }
            }}
            onSearchKeyDown={handleSearchKeyDown}
            onSearchQueryChange={(value) => {
              setSearchQuery(value);
              setHighlightedSearchIndex(-1);
              setIsSearchDropdownOpen(true);
            }}
            participantCount={participantStreamers.length}
            requiredParticipantCount={requiredPlayerCount}
            renderSearchResultStatus={renderSearchResultStatus}
            searchFieldRef={searchFieldRef}
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            searchResults={searchResults}
            selectedStreamerId={selectedStreamerId}
            showSearchDropdown={showSearchDropdown}
          />

          <DraftStreamerBoardSection
            activeLineRows={activeLineRows}
            board={board}
            canCreateRoom={canCreateRoom}
            coachEnabled={coachEnabled}
            headCoachEnabled={headCoachEnabled}
            hoveredSlot={hoveredSlot}
            isPartyMode={isPartyMode}
            onClearAllSlots={clearAllSlots}
            onCoachSlotToggle={handleCoachSlotToggle}
            onClearSlot={clearSlot}
            onCreateRoom={handleCreateRoom}
            onHeadCoachSlotToggle={handleHeadCoachSlotToggle}
            onParticipantDragEnd={handleChipDragEnd}
            onParticipantDragStart={handleChipDragStart}
            onRunAutoPlacement={() => {
              runAutoPlacement({});
            }}
            onSlotDragEnter={handleSlotDragEnter}
            onSlotDragLeave={handleSlotDragLeave}
            onSlotDragOver={handleSlotDragOver}
            onSlotDrop={handleSlotDrop}
            onSlotTap={handleSlotTap}
            onStreamerSelect={handleChipSelect}
            selectedStreamerId={selectedStreamerId}
            streamerMap={streamerMap}
            visibleColumnCount={visibleColumnCount}
          />
        </div>
      </div>
    </main>
  );
}

function DraftStreamerSetupPage() {
  const searchParams = useSearchParams();
  const initializeRoomSettings = useDraftRoomSettingsStore((state) => state.initializeRoomSettings);
  const isSettingsInitialized = useDraftRoomSettingsStore((state) => state.isSettingsInitialized);
  const board = useDraftStreamerSetupStore((state) => state.board);
  const initializeStreamerSetup = useDraftStreamerSetupStore((state) => state.initializeStreamerSetup);
  const isStreamerSetupInitialized = useDraftStreamerSetupStore(
    (state) => state.isStreamerSetupInitialized,
  );
  const participantIds = useDraftStreamerSetupStore((state) => state.participantIds);
  const tournamentId = useDraftStreamerSetupStore((state) => state.tournamentId);
  const hasHandledInitialSeedRef = useRef(false);
  const snapshot = useMemo(
    () => parseDraftRoomSnapshot(searchParams.get("config")),
    [searchParams],
  );
  const initialParticipationMode = sanitizeParticipationMode(searchParams.get("mode"));
  const initialDraftType = sanitizeDraftType(
    searchParams.get("draftType") ?? searchParams.get("type"),
  );
  const initialTournamentId = sanitizeTournamentId(searchParams.get("tournament"));
  const initialTeamCount = sanitizeTeamCount(searchParams.get("teamCount"));
  const initialTeamSize = sanitizeTeamSize(
    searchParams.get("teamSize") ?? searchParams.get("membersPerTeam"),
  );
  const { coachEnabled: inferredCoachEnabled, headCoachEnabled: inferredHeadCoachEnabled } =
    deriveDraftCreateBooleans(initialTeamSize);
  const initialCoachEnabled =
    sanitizeBooleanFlag(searchParams.get("coachEnabled")) || inferredCoachEnabled;
  const initialHeadCoachEnabled =
    sanitizeBooleanFlag(searchParams.get("headCoachEnabled")) || inferredHeadCoachEnabled;
  const placedStreamerCount = useMemo(() => getPlacedDraftStreamerIds(board).length, [board]);

  useEffect(() => {
    const nextInitialState = snapshot
      ? createDraftCreateFlowStateFromSnapshot(snapshot)
      : createInitialDraftCreateFlowState({
          draftType: initialDraftType,
          coachEnabled: initialCoachEnabled,
          headCoachEnabled: initialHeadCoachEnabled,
          participationMode: initialParticipationMode,
          teamCount: initialTeamCount,
          teamSize: initialTeamSize,
          tournamentId: initialTournamentId,
        });

    if (!isSettingsInitialized) {
      initializeRoomSettings({
        draftType: nextInitialState.draftType,
        participationMode: nextInitialState.participationMode,
        teamCount: nextInitialState.teamCount,
        teamSize: nextInitialState.teamSize,
        tournamentId: nextInitialState.tournamentId,
      });
    }

    if (!isStreamerSetupInitialized) {
      initializeStreamerSetup(nextInitialState);
      hasHandledInitialSeedRef.current = true;
      return;
    }

    if (hasHandledInitialSeedRef.current) {
      return;
    }

    const shouldSeedPresetBoard =
      !snapshot &&
      tournamentId === initialTournamentId &&
      tournamentId !== customTournamentId &&
      participantIds.length === 0 &&
      placedStreamerCount === 0;
    const shouldResetCustomBoard =
      !snapshot &&
      tournamentId === customTournamentId &&
      initialTournamentId === customTournamentId &&
      (participantIds.length > 0 || placedStreamerCount > 0);

    if (shouldSeedPresetBoard) {
      initializeStreamerSetup(nextInitialState);
      hasHandledInitialSeedRef.current = true;
      return;
    }

    if (shouldResetCustomBoard) {
      initializeStreamerSetup(nextInitialState);
      hasHandledInitialSeedRef.current = true;
      return;
    }

    hasHandledInitialSeedRef.current = true;
  }, [
    board,
    initialCoachEnabled,
    initialDraftType,
    initialHeadCoachEnabled,
    initialParticipationMode,
    initialTeamCount,
    initialTeamSize,
    initialTournamentId,
    initializeRoomSettings,
    initializeStreamerSetup,
    isSettingsInitialized,
    isStreamerSetupInitialized,
    participantIds.length,
    placedStreamerCount,
    snapshot,
    tournamentId,
  ]);

  if (!isSettingsInitialized || !isStreamerSetupInitialized) {
    return (
      <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
        <section className="rounded-3xl border border-border bg-surface p-6 text-sm font-semibold text-text-secondary shadow-sm">
          참가 스트리머 설정을 불러오는 중입니다.
        </section>
      </main>
    );
  }

  return <DraftStreamerSetupContent />;
}

export default function DraftCreateStreamersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
          <section className="rounded-3xl border border-border bg-surface p-6 text-sm font-semibold text-text-secondary shadow-sm">
            방 설정을 불러오는 중입니다.
          </section>
        </main>
      }
    >
      <DraftStreamerSetupPage />
    </Suspense>
  );
}

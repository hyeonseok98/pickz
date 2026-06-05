"use client";

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
import {
  STREAMER_DIRECTORY,
  STREAMER_DIRECTORY_BY_ID,
  STREAMER_DIRECTORY_BY_NAME,
  draftLineLabelMap,
  draftLineRows,
  draftTypeLabelMap,
  participationModeLabelMap,
  teamCountOptions,
  teamSizeOptions,
} from "@/constants/drafts";
import {
  DraftStepper,
  DraftStreamerBasicSettingsSection,
  DraftStreamerBoardSection,
  DraftStreamerPartyShareSection,
  DraftStreamerSearchSection,
} from "@/components/draft/create";
import { StatusChip } from "@/components/draft/create/streamers/draft-streamer-setup-primitives";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useDraftCreateStore } from "@/stores/drafts";
import {
  compareDraftLineOrder,
  createEmptyDraftBoard,
  getActiveDraftLines,
  getPlacedDraftStreamerIds,
  matchesStreamerSearchQuery,
  normalizeDraftBoard,
  serializeDraftRoomSnapshot,
} from "@/utils";
import type {
  BoardState,
  DraftType,
  DraftCreateFlowState,
  LineKey,
  ParticipationMode,
  TeamCount,
  TeamSize,
} from "@/types/drafts";

interface Streamer {
  avatarDataUrl: string;
  id: string;
  line: LineKey;
  name: string;
  note?: string;
}

interface Tournament {
  description: string;
  id: string;
  name: string;
  roster: Streamer[];
}

const leaveMessage = "이 페이지를 나가면 작성 중이던 내용이 사라집니다. 이동할까요?";

const customTournamentId = "custom";

function createTournament(
  id: string,
  name: string,
  description: string,
  rosterByLine: Partial<Record<LineKey, string[]>>,
): Tournament {
  return {
    description,
    id,
    name,
    roster: draftLineRows.flatMap(({ key }) =>
      (rosterByLine[key] ?? []).reduce<Streamer[]>((accumulator, streamerName, index) => {
        const streamerProfile = STREAMER_DIRECTORY_BY_NAME.get(streamerName);

        if (!streamerProfile) {
          return accumulator;
        }

        accumulator.push({
          avatarDataUrl: streamerProfile.avatarDataUrl,
          id: streamerProfile.id,
          line: key,
          name: streamerName,
          note: `${draftLineLabelMap[key]} 추천 슬롯 ${index + 1}`,
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
  createTournament("pickz-invitational", "Pickz Invitational", "현재 mock 데이터와 연결된 자동 배치 예시 대회", {
    top: ["플레임", "침착맨", "운타라", "랄로", "풍월량"],
    jungle: ["피닉스박", "울프", "따효니", "앰비션", "강퀴88"],
    mid: ["도파", "갱맘 GBM", "괴물쥐", "탬탬버린", "정령왕임"],
    adc: ["한동숙", "러너", "뱅", "김블루", "플레임TV"],
    support: ["실프", "서새봄냥 SEBOM", "소니쇼", "강지", "다주"],
    headCoach: ["매드라이프 MadLife", "룩삼", "김도", "삼식", "쌍베"],
    coach: ["소풍왔니", "양아지", "이춘향", "릴카", "강소연"],
  }),
] satisfies Tournament[];

const customTournament: Tournament = {
  description: "직접 참여 스트리머를 검색해 라인에 배치하는 사용자 설정 모드",
  id: customTournamentId,
  name: "사용자 설정",
  roster: STREAMER_DIRECTORY.map((streamer) => ({
    avatarDataUrl: streamer.avatarDataUrl,
    id: streamer.id,
    line: streamer.line,
    name: streamer.name,
    note: `${draftLineLabelMap[streamer.line]} 직접 배치`,
  })),
};

const tournamentOptions = [customTournament, ...tournaments] satisfies Tournament[];
const tournamentMap = new Map(tournamentOptions.map((tournament) => [tournament.id, tournament]));

const partyParticipants = [
  { id: "host", name: "나", status: "방장" },
  { id: "guest-1", name: "귀여운 Pickz1", status: "초대 링크 확인" },
  { id: "guest-2", name: "반짝이는 Pickz2", status: "입장 대기" },
];

function createAutoBoard(tournament: Tournament, teamCount: TeamCount, teamSize: TeamSize): BoardState {
  const nextBoard = createEmptyDraftBoard();
  const activeLines = getActiveDraftLines(teamSize);
  const columnCount = Number(teamCount);

  activeLines.forEach(({ key }) => {
    const lineRoster = tournament.roster.filter((streamer) => streamer.line === key).slice(0, columnCount);

    lineRoster.forEach((streamer, index) => {
      nextBoard[key][index] = streamer.id;
    });
  });

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

function isTeamCount(value: string | null): value is TeamCount {
  return value !== null && teamCountOptions.some((option) => option === value);
}

function sanitizeTeamCount(value: string | null): TeamCount {
  return isTeamCount(value) ? value : "5";
}

function isTeamSize(value: string | null): value is TeamSize {
  return value !== null && teamSizeOptions.some((option) => option === value);
}

function sanitizeTeamSize(value: string | null): TeamSize {
  return isTeamSize(value) ? value : "5";
}

function createInitialDraftCreateFlowState({
  draftType,
  participationMode,
  teamCount,
  teamSize,
  tournamentId,
}: {
  draftType: DraftType;
  participationMode: ParticipationMode;
  teamCount: TeamCount;
  teamSize: TeamSize;
  tournamentId: string;
}): DraftCreateFlowState {
  const tournament = tournamentMap.get(tournamentId) ?? customTournament;
  const board =
    tournament.id === customTournamentId
      ? createEmptyDraftBoard()
      : createAutoBoard(tournament, teamCount, teamSize);
  const participantIds = tournament.id === customTournamentId ? [] : getPlacedDraftStreamerIds(board);

  return {
    board,
    draftType,
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

function ArrowLeftIcon() {
  return (
    <Image src="/icons/arrow_back.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
  );
}

function DraftStreamerSetupContent() {
  const router = useRouter();
  const {
    addParticipant: addParticipantToDraft,
    applyTournamentSelection,
    board,
    clearBoard,
    clearBoardSlot,
    draftType,
    participantIds,
    participationMode,
    placeParticipant,
    removeParticipant: removeParticipantFromDraft,
    setTeamCount,
    setTeamSize,
    teamCount,
    teamSize,
    tournamentId,
    visibility,
  } = useDraftCreateStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [draggingStreamerId, setDraggingStreamerId] = useState<string | null>(null);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(-1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [initialSnapshotJson] = useState(() =>
    JSON.stringify({
      board,
      draftType,
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
  const [hoveredSlot, setHoveredSlot] = useState<{ index: number; line: LineKey } | null>(null);
  const searchFieldRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isPartyMode = participationMode === "party";
  const currentTournament = tournamentMap.get(tournamentId) ?? customTournament;
  const activeLineRows = useMemo(() => getActiveDraftLines(teamSize), [teamSize]);
  const visibleColumnCount = Number(teamCount);
  const maxPartyParticipants = Number(teamCount);
  const visiblePartyParticipants = partyParticipants.slice(0, maxPartyParticipants);
  const partyParticipantSlots = Array.from(
    { length: maxPartyParticipants },
    (_, index) => visiblePartyParticipants[index] ?? null,
  );
  const streamerMap = STREAMER_DIRECTORY_BY_ID;

  const placedIds = useMemo(() => getPlacedDraftStreamerIds(board), [board]);

  const totalSlots = Number(teamCount) * Number(teamSize);
  const placedCount = placedIds.length;
  const requiredPlayerCount = Number(teamCount) * Number(teamSize);
  const remainingRequiredCount = Math.max(requiredPlayerCount - placedCount, 0);

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

  const inviteLink = `https://pickz.gg/draft/${currentTournament.id}-${draftType}-${teamCount}${teamSize}`;
  const isDirty = useMemo(
    () =>
      JSON.stringify({
        board,
        draftType,
        participantIds,
        participationMode,
        password: "",
        roomTitle: "",
        teamCount,
        teamSize,
        tournamentId,
        visibility,
      }) !== initialSnapshotJson,
    [board, draftType, initialSnapshotJson, participantIds, participationMode, teamCount, teamSize, tournamentId, visibility],
  );
  const canCreateRoom = placedCount >= requiredPlayerCount;

  const closeSearchDropdown = () => {
    setIsSearchDropdownOpen(false);
    setHighlightedSearchIndex(-1);
  };

  useUnsavedChangesGuard(isDirty, leaveMessage);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copied]);

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

  const updateTeamCount = (teamCount: TeamCount) => {
    setTeamCount(teamCount);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const updateTeamSize = (nextTeamSize: TeamSize) => {
    setTeamSize(nextTeamSize);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const runAutoPlacement = (tournamentId: string) => {
    const tournament = tournamentMap.get(tournamentId) ?? customTournament;
    const board =
      tournament.id === customTournamentId
        ? createEmptyDraftBoard()
        : createAutoBoard(tournament, teamCount, teamSize);
    const participantIds =
      tournament.id === customTournamentId ? [] : getPlacedDraftStreamerIds(board);

    applyTournamentSelection({
      board,
      participantIds,
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

  const clearSlot = (line: LineKey, index: number) => {
    clearBoardSlot(line, index);
  };

  const canPlaceStreamerOnBoard = (streamerId: string) => {
    return participantIds.includes(streamerId) && streamerMap.has(streamerId);
  };

  const placeStreamerIntoSlot = (streamerId: string, line: LineKey, index: number) => {
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
        <StatusChip className="border-violet-300 bg-violet-100 text-violet-700">
          추가됨
        </StatusChip>
      );
    }

    return (
      <StatusChip className="border-border bg-surface text-text-secondary">
        추가 가능
      </StatusChip>
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

  const handleSlotDragEnter = (event: DragEvent<HTMLDivElement>, line: LineKey, index: number) => {
    const streamerId = draggingStreamerId ?? event.dataTransfer.getData("text/plain");

    if (!streamerId || !canPlaceStreamerOnBoard(streamerId)) {
      return;
    }

    event.preventDefault();
    setHoveredSlot({ index, line });
  };

  const handleSlotDragOver = (event: DragEvent<HTMLDivElement>, line: LineKey, index: number) => {
    const streamerId = draggingStreamerId ?? event.dataTransfer.getData("text/plain");

    if (!streamerId || !canPlaceStreamerOnBoard(streamerId)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setHoveredSlot({ index, line });
  };

  const handleSlotDragLeave = (line: LineKey, index: number) => {
    if (hoveredSlot?.line === line && hoveredSlot.index === index) {
      setHoveredSlot(null);
    }
  };

  const handleSlotDrop = (event: DragEvent<HTMLDivElement>, line: LineKey, index: number) => {
    const streamerId = draggingStreamerId ?? event.dataTransfer.getData("text/plain");

    if (!streamerId) {
      return;
    }

    event.preventDefault();
    placeStreamerIntoSlot(streamerId, line, index);
  };

  const handleSlotTap = (line: LineKey, index: number) => {
    if (!isMobileViewport || !selectedStreamerId) {
      return;
    }

    placeStreamerIntoSlot(selectedStreamerId, line, index);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleCreateRoom = () => {
    if (!canCreateRoom) {
      return;
    }

    const encodedSnapshot = serializeDraftRoomSnapshot({
      board: normalizeDraftBoard(board, teamCount, teamSize),
      draftType,
      inviteLink,
      joinedParticipantNames: isPartyMode ? visiblePartyParticipants.map((participant) => participant.name) : [],
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
    });

    if (isPartyMode) {
      router.push(`/draft/create/invite?${nextParams.toString()}`);
      return;
    }

    router.push(`/draft/snake?${nextParams.toString()}`);
  };

  return (
    <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5">
        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <Link
            href="/draft"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeftIcon />
            <span>드래프트 선택으로 돌아가기</span>
          </Link>

          <DraftStepper currentStep="streamers" mode={participationMode} />

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
                참가 스트리머 설정
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <StatusChip tone="muted">방식 {draftTypeLabelMap[draftType]}</StatusChip>
              <StatusChip tone="muted">모드 {participationModeLabelMap[participationMode]}</StatusChip>
              <StatusChip tone="muted">
                보드 {teamSize} x {teamCount}
              </StatusChip>
            </div>
          </div>

          <DraftStreamerBasicSettingsSection
            onTeamCountChange={(value) => {
              updateTeamCount(sanitizeTeamCount(value));
            }}
            onTeamSizeChange={(value) => {
              updateTeamSize(sanitizeTeamSize(value));
            }}
            onTournamentChange={runAutoPlacement}
            teamCount={teamCount}
            teamCountOptions={teamCountOptions}
            teamSize={teamSize}
            teamSizeOptions={teamSizeOptions}
            tournamentId={tournamentId}
            tournamentOptions={tournamentOptions}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-11">
          {isPartyMode ? (
            <DraftStreamerPartyShareSection
              copied={copied}
              inviteLink={inviteLink}
              maxPartyParticipants={maxPartyParticipants}
              onCopyInviteLink={copyInviteLink}
              partyParticipantSlots={partyParticipantSlots}
              visiblePartyParticipantsCount={visiblePartyParticipants.length}
            />
          ) : null}

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
            hoveredSlot={hoveredSlot}
            isPartyMode={isPartyMode}
            onClearAllSlots={clearAllSlots}
            onClearSlot={clearSlot}
            onCreateRoom={handleCreateRoom}
            onParticipantDragEnd={handleChipDragEnd}
            onParticipantDragStart={handleChipDragStart}
            onRunAutoPlacement={() => {
              runAutoPlacement(tournamentId);
            }}
            onSlotDragEnter={handleSlotDragEnter}
            onSlotDragLeave={handleSlotDragLeave}
            onSlotDragOver={handleSlotDragOver}
            onSlotDrop={handleSlotDrop}
            onSlotTap={handleSlotTap}
            onStreamerSelect={handleChipSelect}
            placedCount={placedCount}
            remainingRequiredCount={remainingRequiredCount}
            requiredPlayerCount={requiredPlayerCount}
            selectedStreamerId={selectedStreamerId}
            streamerMap={streamerMap}
            totalSlots={totalSlots}
            visibleColumnCount={visibleColumnCount}
          />
        </div>
      </div>
    </main>
  );
}

function DraftStreamerSetupPage() {
  const searchParams = useSearchParams();
  const initializeStreamers = useDraftCreateStore((state) => state.initializeStreamers);
  const isInitialized = useDraftCreateStore((state) => state.isInitialized);
  const initialParticipationMode = sanitizeParticipationMode(searchParams.get("mode"));
  const initialDraftType = sanitizeDraftType(searchParams.get("draftType") ?? searchParams.get("type"));
  const initialTournamentId = sanitizeTournamentId(searchParams.get("tournament"));
  const initialTeamCount = sanitizeTeamCount(searchParams.get("teamCount"));
  const initialTeamSize = sanitizeTeamSize(
    searchParams.get("teamSize") ?? searchParams.get("membersPerTeam"),
  );

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    initializeStreamers(
      createInitialDraftCreateFlowState({
        draftType: initialDraftType,
        participationMode: initialParticipationMode,
        teamCount: initialTeamCount,
        teamSize: initialTeamSize,
        tournamentId: initialTournamentId,
      }),
    );
  }, [
    initialDraftType,
    initialParticipationMode,
    initialTeamCount,
    initialTeamSize,
    initialTournamentId,
    initializeStreamers,
    isInitialized,
  ]);

  if (!isInitialized) {
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

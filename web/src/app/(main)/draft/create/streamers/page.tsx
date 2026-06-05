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
  type ReactNode,
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
import { DraftActionFooter, DraftStepper } from "@/components/draft/create";
import { DraftStreamerCard } from "@/components/draft/streamer-card";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useDraftCreateStore } from "@/stores/drafts";
import {
  cn,
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

function SearchIcon() {
  return (
    <Image src="/icons/search.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
  );
}

function CopyIcon() {
  return (
    <Image src="/icons/copy_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M15.5 8A6 6 0 1 0 16 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.5 4.5V8h-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionCard({
  className,
  children,
  description,
  title,
}: {
  className?: string;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6", className)}>
      <div>
        <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-text-primary">{children}</p>;
}

function StatusChip({
  active,
  children,
  className,
  tone = "default",
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
        active
          ? "border-violet-300 bg-violet-100 text-violet-700"
          : tone === "muted"
            ? "border-border bg-surface-muted text-text-secondary"
            : "border-border bg-surface text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}

interface BoardSlotProps {
  draggable?: boolean;
  dropReady?: boolean;
  isMobileViewport?: boolean;
  onDropStreamer: (event: DragEvent<HTMLDivElement>) => void;
  onPlaceSelected?: () => void;
  onSelectStreamer?: () => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onStreamerDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
  onStreamerDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onClear?: () => void;
  selected?: boolean;
  streamer?: Streamer;
  touchReady?: boolean;
}

function BoardSlot({
  draggable = false,
  dropReady = false,
  isMobileViewport = false,
  onClear,
  onDropStreamer,
  onPlaceSelected,
  onSelectStreamer,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onStreamerDragEnd,
  onStreamerDragStart,
  selected = false,
  streamer,
  touchReady = false,
}: BoardSlotProps) {
  if (streamer) {
    return (
      <DraftStreamerCard
        avatarDataUrl={streamer.avatarDataUrl}
        interaction={isMobileViewport ? "select" : draggable ? "drag" : "static"}
        name={streamer.name}
        onClick={onSelectStreamer}
        onDragEnd={onStreamerDragEnd}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDragStart={onStreamerDragStart}
        onDrop={onDropStreamer}
        onRemove={onClear}
        removeLabel={`${streamer.name} 제거`}
        size="slot"
        tone={selected ? "active" : dropReady || touchReady ? "drop" : "default"}
      />
    );
  }

  return (
    <div
      onDrop={onDropStreamer}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      className={cn(
        "relative rounded-3xl border p-2.5 transition-all",
        dropReady || touchReady
          ? "border-violet-300 bg-violet-50 shadow-sm"
          : "border-border bg-surface hover:border-violet-200",
      )}
    >
      <button
        type="button"
        onClick={onPlaceSelected}
        className={cn(
          "flex min-h-20 w-full flex-col items-center justify-center rounded-2xl px-2 text-center",
          onPlaceSelected ? "cursor-pointer" : "cursor-default",
        )}
      >
        <span className="text-xl font-light text-text-muted">+</span>
        <p className="mt-1 text-xs font-semibold text-text-secondary">
          {dropReady ? "여기에 드롭" : touchReady ? "탭해서 배치" : "스트리머 배치"}
        </p>
      </button>
    </div>
  );
}

function SelectField({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      className="h-12 w-full cursor-pointer rounded-2xl border border-border bg-surface px-4 text-sm text-text-primary outline-none transition focus:border-violet-300"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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

          <div className="mt-6 border-t border-border pt-6">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">기본 설정</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                방 설정을 기준으로 참가 스트리머를 검색하고 보드에 배치합니다.
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel>대회 선택</FieldLabel>
                <SelectField
                  value={tournamentId}
                  onChange={(nextTournamentId) => {
                    runAutoPlacement(nextTournamentId);
                  }}
                  options={tournamentOptions.map((tournament) => ({
                    label: tournament.name,
                    value: tournament.id,
                  }))}
                />
                <p className="text-xs leading-5 text-text-secondary">
                  사용자 설정에서는 보드가 비어 있는 상태로 시작합니다.
                </p>
              </div>

              <div className="space-y-2">
                <FieldLabel>팀 개수</FieldLabel>
                <SelectField
                  value={teamCount}
                  onChange={(value) => {
                    updateTeamCount(sanitizeTeamCount(value));
                  }}
                  options={teamCountOptions.map((option) => ({
                    label: `${option}팀`,
                    value: option,
                  }))}
                />
              </div>

              <div className="space-y-2">
                <FieldLabel>팀당 인원</FieldLabel>
                <SelectField
                  value={teamSize}
                  onChange={(value) => {
                    updateTeamSize(sanitizeTeamSize(value));
                  }}
                  options={teamSizeOptions.map((option) => ({
                    label: `${option}명`,
                    value: option,
                  }))}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-11">

          {isPartyMode ? (
            <SectionCard
              className="xl:col-span-11"
              title="참여 상태 및 공유"
              description="같이하기에서는 링크 공유와 현재 참여자 상태를 위쪽에서 바로 확인합니다."
            >
              <div className="grid gap-3 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
                <div className="flex min-h-0 flex-col gap-3">
                  <div className="rounded-3xl border border-border bg-linear-to-br from-surface via-surface to-violet-50 p-4 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.18em] text-text-secondary uppercase">
                      Share Link
                    </p>
                    <p className="mt-2 text-base font-bold tracking-[-0.03em] text-text-primary">
                      링크만 공유하면 바로 입장
                    </p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      같은 URL을 전달하면 참여자가 바로 들어올 수 있습니다.
                    </p>

                    <div className="mt-4 rounded-2xl border border-border bg-surface px-3 py-3">
                      <p className="text-xs font-semibold text-text-secondary">초대 URL</p>
                      <p className="mt-2 break-all text-sm font-medium leading-6 text-text-primary">
                        {inviteLink}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={copyInviteLink}
                      className="mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
                    >
                      <CopyIcon />
                      <span>{copied ? "복사 완료" : "링크 복사"}</span>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                    <p className="text-xs font-semibold text-text-secondary">공유 안내</p>
                    <p className="mt-2 text-sm leading-6 text-text-primary">
                      링크 전달 후 오른쪽 입장 현황에서 누가 들어왔는지만 확인하면 됩니다.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-surface-muted p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">입장 현황</p>
                      <h3 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                        {visiblePartyParticipants.length} / {maxPartyParticipants} 입장
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        참여 인원은 현재 팀 개수 기준으로 입장하며, 먼저 들어온 순서대로 방에 표시됩니다.
                      </p>
                    </div>
                    <StatusChip tone="muted">팀 개수 기준</StatusChip>
                  </div>

                  <div className="mt-4 space-y-2">
                    {partyParticipantSlots.map((participant, index) =>
                      participant ? (
                        <div
                          key={participant.id}
                          className="rounded-2xl border border-border bg-surface px-3 py-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-text-primary">
                                {participant.name}
                              </p>
                              <p className="mt-1 text-xs text-text-secondary">
                                {participant.status}
                              </p>
                            </div>
                            <StatusChip className="shrink-0" tone="muted">
                              입장
                            </StatusChip>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={`party-slot-${index + 1}`}
                          className="rounded-2xl border border-dashed border-border bg-surface px-3 py-3"
                        >
                          <p className="text-sm font-semibold text-text-secondary">
                            참여자 슬롯 {index + 1}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            링크 공유 후 순서대로 입장합니다.
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard
            className="xl:col-span-4"
            title="검색 및 참여 스트리머"
            description="검색 결과에서 사용자를 추가한 뒤, 참여 스트리머 목록에서 드래그해 보드에 배치합니다."
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div ref={searchFieldRef} className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <SearchIcon />
                  </span>
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setHighlightedSearchIndex(-1);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) {
                        setIsSearchDropdownOpen(true);
                      }
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="스트리머 이름으로 검색"
                    className="h-12 w-full rounded-2xl border border-border bg-surface px-4 pl-11 pr-11 text-sm text-text-primary outline-none transition focus:border-violet-300"
                    role="combobox"
                    aria-expanded={showSearchDropdown}
                    aria-controls="streamer-search-results"
                    aria-activedescendant={
                      activeSearchIndex >= 0
                        ? `streamer-search-result-${searchResults[activeSearchIndex]?.id}`
                        : undefined
                    }
                  />
                  {searchQuery.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setHighlightedSearchIndex(-1);
                        setIsSearchDropdownOpen(false);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-text-secondary transition-colors hover:text-text-primary"
                      aria-label="검색어 지우기"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden="true">
                        <path d="m6 6 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="m14 6-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  ) : null}
                  {showSearchDropdown ? (
                    <div
                      id="streamer-search-results"
                      role="listbox"
                      className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
                    >
                      {searchResults.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-text-secondary">
                          현재 검색 조건에 맞는 스트리머가 없습니다.
                        </div>
                      ) : (
                        <div className="max-h-72 overflow-y-auto p-2">
                          {searchResults.map((streamer, index) => (
                            <button
                              type="button"
                              id={`streamer-search-result-${streamer.id}`}
                              key={streamer.id}
                              role="option"
                              aria-selected={activeSearchIndex === index}
                              disabled={streamer.isParticipant}
                              onMouseEnter={() => {
                                setHighlightedSearchIndex(index);
                              }}
                              onClick={() => {
                                if (!streamer.isParticipant) {
                                  addParticipant(streamer.id);
                                }
                              }}
                              className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                                streamer.isParticipant ? "cursor-default opacity-80" : "cursor-pointer",
                                activeSearchIndex === index ? "bg-surface-muted" : "hover:bg-surface-muted",
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <Image
                                  src={streamer.avatarDataUrl}
                                  alt={streamer.name}
                                  width={44}
                                  height={44}
                                  unoptimized
                                  className="size-11 shrink-0 rounded-full bg-surface-muted object-contain"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-text-primary">
                                    {streamer.name}
                                  </p>
                                  <p className="mt-1 text-xs text-text-secondary">
                                    {streamer.isPlaced
                                      ? "현재 보드에 배치된 스트리머"
                                      : streamer.isParticipant
                                        ? "참여 스트리머 목록에서 대기 중"
                                        : "선택하면 참여 스트리머에 추가됩니다."}
                                  </p>
                                </div>
                              </div>

                              {renderSearchResultStatus(streamer.isParticipant, streamer.isPlaced)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="whitespace-nowrap text-sm font-semibold text-text-primary">
                    참여 스트리머
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <StatusChip tone="muted">{participantStreamers.length}명 참여중</StatusChip>
                    <StatusChip tone="muted">{filteredStreamers.length}명 미배치</StatusChip>
                  </div>
                </div>

                {filteredStreamers.length === 0 ? (
                  <div className="mt-3 rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-text-secondary">
                    {participantStreamers.length === 0
                      ? "검색 결과에서 추가한 스트리머가 여기에 표시됩니다."
                      : "현재 참여 스트리머가 모두 보드에 배치되어 있습니다."}
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredStreamers.map((streamer) => (
                      <DraftStreamerCard
                        key={streamer.id}
                        avatarDataUrl={streamer.avatarDataUrl}
                        interaction={isMobileViewport ? "select" : "drag"}
                        name={streamer.name}
                        onClick={() => {
                          handleChipSelect(streamer.id);
                        }}
                        onRemove={() => {
                          removeParticipant(streamer.id);
                        }}
                        onDragEnd={handleChipDragEnd}
                        onDragStart={(event) => {
                          handleChipDragStart(event, streamer.id);
                        }}
                        tone={
                          draggingStreamerId === streamer.id ||
                          (isMobileViewport && selectedStreamerId === streamer.id)
                            ? "active"
                            : "default"
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            className="xl:col-span-7"
            title="라인별 스트리머 배치"
            description="우측 보드는 현재 팀 개수와 팀당 인원 설정에 맞춰 필요한 라인과 슬롯만 보여줍니다."
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  <StatusChip tone="muted">보드 슬롯 {totalSlots}칸</StatusChip>
                  <StatusChip tone="muted">현재 배치 {placedCount}명</StatusChip>
                  <StatusChip tone="muted">현재 설정 필요 {requiredPlayerCount}명</StatusChip>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      runAutoPlacement(tournamentId);
                    }}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
                  >
                    <RefreshIcon />
                    <span>자동 배치</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSlots}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
                  >
                    전체 초기화
                  </button>
                </div>
              </div>

              <div className="hidden lg:block">
                <div
                  className="grid gap-2.5"
                  style={{ gridTemplateColumns: `96px repeat(${visibleColumnCount}, minmax(0, 1fr))` }}
                >
                  <div />
                  {Array.from({ length: visibleColumnCount }, (_, index) => (
                    <div
                      key={`slot-header-${index + 1}`}
                      className="flex items-center justify-center rounded-2xl bg-surface-muted px-2 py-2 text-xs font-semibold text-text-secondary"
                    >
                      슬롯 {index + 1}
                    </div>
                  ))}

                  {activeLineRows.flatMap((line) => {
                    const fillCount = board[line.key].slice(0, visibleColumnCount).filter(Boolean).length;

                    return [
                      <div
                        key={`${line.key}-label`}
                        className="flex items-center justify-center rounded-2xl bg-surface-muted px-3 py-3 text-center"
                        >
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {fillCount} / {visibleColumnCount} 배치
                          </p>
                        </div>
                      </div>,
                      ...board[line.key].slice(0, visibleColumnCount).map((streamerId, index) => (
                        <BoardSlot
                          key={`${line.key}-${index}`}
                          draggable={Boolean(streamerId)}
                          dropReady={hoveredSlot?.line === line.key && hoveredSlot.index === index}
                          isMobileViewport={false}
                          onDragEnter={(event) => {
                            handleSlotDragEnter(event, line.key, index);
                          }}
                          onDragLeave={() => {
                            handleSlotDragLeave(line.key, index);
                          }}
                          onDragOver={(event) => {
                            handleSlotDragOver(event, line.key, index);
                          }}
                          onDropStreamer={(event) => {
                            handleSlotDrop(event, line.key, index);
                          }}
                          onClear={
                            streamerId
                              ? () => {
                                  clearSlot(line.key, index);
                                }
                              : undefined
                          }
                          onPlaceSelected={undefined}
                          onSelectStreamer={undefined}
                          onStreamerDragEnd={handleChipDragEnd}
                          onStreamerDragStart={
                            streamerId
                              ? (event) => {
                                  handleChipDragStart(event, streamerId);
                                }
                              : undefined
                          }
                          selected={false}
                          streamer={streamerId ? streamerMap.get(streamerId) : undefined}
                          touchReady={false}
                        />
                      )),
                    ];
                  })}
                </div>
              </div>

              <div className="space-y-4 lg:hidden">
                {activeLineRows.map((line) => (
                  <div
                    key={line.key}
                    className="rounded-3xl border border-border bg-surface-muted p-4"
                  >
                    <div className="text-center">
                      <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                      <p className="mt-1 text-xs font-semibold text-text-secondary">
                        {board[line.key].slice(0, visibleColumnCount).filter(Boolean).length} / {visibleColumnCount} 배치
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {board[line.key].slice(0, visibleColumnCount).map((streamerId, index) => (
                        <BoardSlot
                          key={`${line.key}-mobile-${index}`}
                          draggable={Boolean(streamerId)}
                          dropReady={hoveredSlot?.line === line.key && hoveredSlot.index === index}
                          isMobileViewport
                          onDragEnter={(event) => {
                            handleSlotDragEnter(event, line.key, index);
                          }}
                          onDragLeave={() => {
                            handleSlotDragLeave(line.key, index);
                          }}
                          onDragOver={(event) => {
                            handleSlotDragOver(event, line.key, index);
                          }}
                          onDropStreamer={(event) => {
                            handleSlotDrop(event, line.key, index);
                          }}
                          onClear={
                            streamerId
                              ? () => {
                                  clearSlot(line.key, index);
                                }
                              : undefined
                          }
                          onPlaceSelected={() => {
                            handleSlotTap(line.key, index);
                          }}
                          onSelectStreamer={
                            streamerId
                              ? () => {
                                  handleChipSelect(streamerId);
                                }
                              : undefined
                          }
                          onStreamerDragEnd={handleChipDragEnd}
                          onStreamerDragStart={
                            streamerId
                              ? (event) => {
                                  handleChipDragStart(event, streamerId);
                                }
                              : undefined
                          }
                          selected={streamerId !== null && selectedStreamerId === streamerId}
                          streamer={streamerId ? streamerMap.get(streamerId) : undefined}
                          touchReady={selectedStreamerId !== null}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <DraftActionFooter
                title={
                  remainingRequiredCount === 0
                    ? "현재 설정 기준 필수 인원 배치가 완료됐습니다."
                    : `${remainingRequiredCount}명 더 배치하면 현재 설정 기준을 충족합니다.`
                }
                description="실제 방 생성 조건은 현재 설정한 팀 수와 팀당 인원을 기준으로 계산됩니다."
                primaryLabel={isPartyMode ? "방 생성하기" : "혼자 시작하기"}
                primaryDisabled={!canCreateRoom}
                onPrimaryClick={handleCreateRoom}
              />
            </div>
          </SectionCard>
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

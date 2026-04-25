"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  STREAMER_DIRECTORY,
  STREAMER_DIRECTORY_BY_ID,
  STREAMER_DIRECTORY_BY_NAME,
} from "@/constants/streamers";
import { DraftStreamerCard } from "@/components/draft/streamer-card";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { cn } from "@/utils";

type DraftType = "snake" | "auction";
type ParticipationMode = "solo" | "party";
type RoomVisibility = "public" | "private";
type TeamCount = "2" | "3" | "4" | "5";
type TeamSize = "3" | "4" | "5";
type LineKey = "top" | "jungle" | "mid" | "adc" | "support";
type BoardState = Record<LineKey, Array<string | null>>;

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

interface DraftCreateEditableState {
  board: BoardState;
  membersPerTeam: TeamSize;
  password: string;
  participantIds: string[];
  teamCount: TeamCount;
  tournamentId: string;
  visibility: RoomVisibility;
}

const leaveMessage = "이 페이지를 나가면 작성 중이던 내용이 사라집니다. 이동할까요?";

const lineRows: Array<{ key: LineKey; label: string }> = [
  { key: "top", label: "탑" },
  { key: "jungle", label: "정글" },
  { key: "mid", label: "미드" },
  { key: "adc", label: "원딜" },
  { key: "support", label: "서폿" },
];

const lineLabelMap: Record<LineKey, string> = {
  adc: "원딜",
  jungle: "정글",
  mid: "미드",
  support: "서폿",
  top: "탑",
};

const draftTypeLabelMap: Record<DraftType, string> = {
  auction: "경매 드래프트",
  snake: "스네이크 드래프트",
};

const participationModeLabelMap: Record<ParticipationMode, string> = {
  party: "같이하기",
  solo: "혼자하기",
};

const teamCountOptions: TeamCount[] = ["2", "3", "4", "5"];
const teamSizeOptions: TeamSize[] = ["3", "4", "5"];
const customTournamentId = "custom";

function createEmptyBoard(): BoardState {
  return {
    adc: Array.from({ length: 5 }, () => null),
    jungle: Array.from({ length: 5 }, () => null),
    mid: Array.from({ length: 5 }, () => null),
    support: Array.from({ length: 5 }, () => null),
    top: Array.from({ length: 5 }, () => null),
  };
}

function cloneBoard(board: BoardState): BoardState {
  return {
    adc: [...board.adc],
    jungle: [...board.jungle],
    mid: [...board.mid],
    support: [...board.support],
    top: [...board.top],
  };
}

function getActiveLineRows(teamSize: TeamSize) {
  return lineRows.slice(0, Number(teamSize));
}

function normalizeBoard(board: BoardState, teamCount: TeamCount, teamSize: TeamSize): BoardState {
  const nextBoard = createEmptyBoard();
  const activeLineKeys = new Set(getActiveLineRows(teamSize).map((line) => line.key));
  const columnCount = Number(teamCount);

  lineRows.forEach(({ key }) => {
    nextBoard[key] = nextBoard[key].map((_, index) =>
      activeLineKeys.has(key) && index < columnCount ? board[key][index] : null,
    );
  });

  return nextBoard;
}

function createTournament(
  id: string,
  name: string,
  description: string,
  rosterByLine: Record<LineKey, string[]>,
): Tournament {
  return {
    description,
    id,
    name,
    roster: lineRows.flatMap(({ key }) =>
      rosterByLine[key].reduce<Streamer[]>((accumulator, streamerName, index) => {
        const streamerProfile = STREAMER_DIRECTORY_BY_NAME.get(streamerName);

        if (!streamerProfile) {
          return accumulator;
        }

        accumulator.push({
          avatarDataUrl: streamerProfile.avatarDataUrl,
          id: streamerProfile.id,
          line: key,
          name: streamerName,
          note: `${lineLabelMap[key]} 추천 슬롯 ${index + 1}`,
        });

        return accumulator;
      }, []),
    ),
  };
}

const tournaments = [
  createTournament("lck-2025-spring", "LCK 2025 Spring", "2025 스프링 기준 라인별 주전 풀", {
    adc: ["Deft", "Viper", "Gumayusi", "Aiming", "Jiwoo"],
    jungle: ["Canyon", "Oner", "Peanut", "Lucid", "Cuzz"],
    mid: ["Faker", "Chovy", "ShowMaker", "Bdd", "Clozer"],
    support: ["Keria", "Delight", "BeryL", "Lehends", "Andil"],
    top: ["Zeus", "Kingen", "Doran", "Morgan", "DuDu"],
  }),
  createTournament("msi-showcase", "MSI Showcase", "국제전 밸런스 기준으로 구성한 자동 배치 풀", {
    adc: ["Ruler", "Elk", "GALA", "Noah", "Aiming"],
    jungle: ["Wei", "Xun", "Oner", "Tarzan", "Kanavi"],
    mid: ["Knight", "Scout", "Faker", "Caps", "Zeka"],
    support: ["Missing", "ON", "Keria", "Mikyx", "Life"],
    top: ["Bin", "369", "Zeus", "Kiin", "Photon"],
  }),
  createTournament("streamer-rivals", "Streamer Rivals", "방송인 친선전 기준 라인별 추천 후보군", {
    adc: ["배돈", "다누리", "하꼬원딜", "러너", "앰비션봇"],
    jungle: ["캡틴잭", "울프", "따효니", "피닉스박", "랄로"],
    mid: ["괴물쥐", "탬탬버린", "도현", "김블루", "뚜띠"],
    support: ["에스카", "실프", "김나성", "서새봄", "소니쇼"],
    top: ["침착맨", "풍월량", "옥냥이", "얍얍", "녹두로"],
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
    note: `${lineLabelMap[streamer.line]} 직접 배치`,
  })),
};

const tournamentOptions = [customTournament, ...tournaments] satisfies Tournament[];
const tournamentMap = new Map(tournamentOptions.map((tournament) => [tournament.id, tournament]));

const partyParticipants = [
  { id: "host", name: "나", status: "방장" },
  { id: "guest-1", name: "Player456", status: "초대 링크 확인" },
  { id: "guest-2", name: "Gamer789", status: "입장 대기" },
];

function createAutoBoard(tournament: Tournament, teamCount: TeamCount, teamSize: TeamSize): BoardState {
  const nextBoard = createEmptyBoard();
  const activeLines = getActiveLineRows(teamSize);
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
  return value === "solo" ? "solo" : "party";
}

function sanitizeTournamentId(value: string | null): string {
  if (value && tournamentMap.has(value)) {
    return value;
  }

  return customTournamentId;
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M15 10H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m9 5-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m10.5 5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <rect x="7" y="4" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 7.5V6a2 2 0 0 1 2-2h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 8.5V14a2 2 0 0 0 2 2h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 3.5c2.1 2.2 3.3 5.3 3.3 8.5S14.1 18.3 12 20.5C9.9 18.3 8.7 15.2 8.7 12S9.9 5.7 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
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

function StepPill({
  active = false,
  label,
}: {
  active?: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
        active
          ? "border-violet-200 bg-violet-100 text-violet-700"
          : "border-border bg-surface text-text-secondary",
      )}
    >
      {label}
    </span>
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

export default function DraftCreatePage() {
  const searchParams = useSearchParams();
  const participationMode = sanitizeParticipationMode(searchParams.get("mode"));
  const draftType = sanitizeDraftType(searchParams.get("type"));
  const initialTournamentId = sanitizeTournamentId(searchParams.get("tournament"));

  const initialState = useMemo<DraftCreateEditableState>(() => {
    const tournament = tournamentMap.get(initialTournamentId) ?? customTournament;
    const teamCount: TeamCount = "5";
    const membersPerTeam: TeamSize = "5";
    const board =
      tournament.id === customTournamentId
        ? createEmptyBoard()
        : createAutoBoard(tournament, teamCount, membersPerTeam);
    const participantIds = Array.from(
      new Set(
        Object.values(board).flatMap((slots) => slots.filter((value): value is string => value !== null)),
      ),
    );

    return {
      board,
      membersPerTeam,
      password: "",
      participantIds,
      teamCount,
      tournamentId: tournament.id,
      visibility: "public",
    };
  }, [initialTournamentId]);

  const [state, setState] = useState<DraftCreateEditableState>(initialState);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [draggingStreamerId, setDraggingStreamerId] = useState<string | null>(null);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(-1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [selectedStreamerId, setSelectedStreamerId] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ index: number; line: LineKey } | null>(null);

  const isPartyMode = participationMode === "party";
  const currentTournament = tournamentMap.get(state.tournamentId) ?? customTournament;
  const activeLineRows = useMemo(() => getActiveLineRows(state.membersPerTeam), [state.membersPerTeam]);
  const visibleColumnCount = Number(state.teamCount);
  const participantIdSet = useMemo(() => new Set(state.participantIds), [state.participantIds]);
  const streamerMap = STREAMER_DIRECTORY_BY_ID;

  const placedIds = useMemo(() => {
    const ids = new Set<string>();

    lineRows.forEach(({ key }) => {
      state.board[key].forEach((streamerId) => {
        if (streamerId) {
          ids.add(streamerId);
        }
      });
    });

    return ids;
  }, [state.board]);

  const totalSlots = Number(state.teamCount) * Number(state.membersPerTeam);
  const placedCount = placedIds.size;
  const requiredPlayerCount = Number(state.teamCount) * Number(state.membersPerTeam);
  const remainingRequiredCount = Math.max(requiredPlayerCount - placedCount, 0);

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return [];
    }

    return STREAMER_DIRECTORY.filter((streamer) => streamer.name.toLowerCase().includes(normalizedQuery))
      .map((streamer) => ({
        ...streamer,
        isParticipant: participantIdSet.has(streamer.id),
        isPlaced: placedIds.has(streamer.id),
      }))
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, 8);
  }, [participantIdSet, placedIds, searchQuery]);

  const participantStreamers = useMemo(
    () =>
      state.participantIds
        .map((participantId) => streamerMap.get(participantId))
        .filter((streamer): streamer is NonNullable<typeof streamer> => Boolean(streamer)),
    [state.participantIds, streamerMap],
  );

  const filteredStreamers = useMemo(() => {
    return participantStreamers
      .filter((streamer) => !placedIds.has(streamer.id))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [participantStreamers, placedIds]);
  const showSearchDropdown = searchQuery.trim().length > 0;
  const activeSearchIndex =
    highlightedSearchIndex < 0
      ? -1
      : Math.min(highlightedSearchIndex, Math.max(searchResults.length - 1, 0));

  const inviteLink = `https://pickz.gg/draft/${currentTournament.id}-${draftType}-${state.teamCount}${state.membersPerTeam}`;
  const isDirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(initialState),
    [initialState, state],
  );
  const requiresPassword = isPartyMode && state.visibility === "private";
  const canCreateRoom = placedCount >= requiredPlayerCount && (!requiresPassword || state.password.trim().length >= 4);

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

  const updateState = <Key extends keyof DraftCreateEditableState>(
    key: Key,
    value: DraftCreateEditableState[Key],
  ) => {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const addParticipant = (streamerId: string) => {
    setState((current) => {
      if (current.participantIds.includes(streamerId)) {
        return current;
      }

      return {
        ...current,
        participantIds: [...current.participantIds, streamerId],
      };
    });
    setSearchQuery("");
    setHighlightedSearchIndex(-1);
  };

  const removeParticipant = (streamerId: string) => {
    setState((current) => {
      const nextBoard = cloneBoard(current.board);

      lineRows.forEach(({ key }) => {
        nextBoard[key] = nextBoard[key].map((value) => (value === streamerId ? null : value));
      });

      return {
        ...current,
        board: nextBoard,
        participantIds: current.participantIds.filter((participantId) => participantId !== streamerId),
      };
    });

    if (draggingStreamerId === streamerId) {
      setDraggingStreamerId(null);
    }

    if (selectedStreamerId === streamerId) {
      setSelectedStreamerId(null);
    }
  };

  const updateTeamCount = (teamCount: TeamCount) => {
    setState((current) => ({
      ...current,
      board: normalizeBoard(current.board, teamCount, current.membersPerTeam),
      teamCount,
    }));
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const updateTeamSize = (membersPerTeam: TeamSize) => {
    setState((current) => ({
      ...current,
      board: normalizeBoard(current.board, current.teamCount, membersPerTeam),
      membersPerTeam,
    }));
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const runAutoPlacement = (tournamentId: string) => {
    const tournament = tournamentMap.get(tournamentId) ?? customTournament;
    const board =
      tournament.id === customTournamentId
        ? createEmptyBoard()
        : createAutoBoard(tournament, state.teamCount, state.membersPerTeam);
    const participantIds =
      tournament.id === customTournamentId
        ? []
        : Array.from(
            new Set(
              Object.values(board).flatMap((slots) =>
                slots.filter((value): value is string => value !== null),
              ),
            ),
          );

    setState((current) => ({
      ...current,
      board,
      participantIds,
      tournamentId: tournament.id,
    }));
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const clearAllSlots = () => {
    setState((current) => ({
      ...current,
      board: createEmptyBoard(),
    }));
    setDraggingStreamerId(null);
    setHoveredSlot(null);
    setSelectedStreamerId(null);
  };

  const clearSlot = (line: LineKey, index: number) => {
    setState((current) => {
      const nextBoard = cloneBoard(current.board);
      nextBoard[line][index] = null;

      return {
        ...current,
        board: nextBoard,
      };
    });
  };

  const canPlaceStreamerOnBoard = (streamerId: string) => {
    return participantIdSet.has(streamerId) && streamerMap.has(streamerId);
  };

  const placeStreamerIntoSlot = (streamerId: string, line: LineKey, index: number) => {
    if (!canPlaceStreamerOnBoard(streamerId)) {
      return;
    }

    setState((current) => {
      const nextBoard = cloneBoard(current.board);

      lineRows.forEach(({ key }) => {
        nextBoard[key] = nextBoard[key].map((value) => (value === streamerId ? null : value));
      });

      nextBoard[line][index] = streamerId;

      return {
        ...current,
        board: nextBoard,
      };
    });
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
          대기중
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
        setSearchQuery("");
        setHighlightedSearchIndex(-1);
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
        activeSearchIndex >= 0
          ? searchResults[activeSearchIndex]
          : searchResults[0];

      if (!targetStreamer || targetStreamer.isParticipant) {
        return;
      }

      event.preventDefault();
      addParticipant(targetStreamer.id);
      return;
    }

    if (event.key === "Escape") {
      setSearchQuery("");
      setHighlightedSearchIndex(-1);
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

          <div className="mt-5 flex flex-wrap items-center gap-2 text-text-muted">
            <StepPill label="1. 방식 선택" />
            <span className="text-xs">›</span>
            <StepPill label="2. 참여 모드" />
            <span className="text-xs">›</span>
            <StepPill active label="3. 생성 완료" />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
                드래프트 방 설정
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <StatusChip tone="muted">방식 {draftTypeLabelMap[draftType]}</StatusChip>
              <StatusChip tone="muted">모드 {participationModeLabelMap[participationMode]}</StatusChip>
              <StatusChip tone="muted">
                보드 {state.membersPerTeam} x {state.teamCount}
              </StatusChip>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">기본 설정</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                위쪽에서 대회와 팀 구성을 먼저 맞춘 뒤, 아래에서 바로 검색과 배치를 진행합니다.
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel>대회 선택</FieldLabel>
                <SelectField
                  value={state.tournamentId}
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
                  value={state.teamCount}
                  onChange={(value) => {
                    updateTeamCount(value as TeamCount);
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
                  value={state.membersPerTeam}
                  onChange={(value) => {
                    updateTeamSize(value as TeamSize);
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
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                      onClick={() => {
                        updateState("visibility", "public");
                        updateState("password", "");
                      }}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                        state.visibility === "public"
                          ? "border-violet-300 bg-violet-100"
                          : "border-border bg-surface",
                    )}
                  >
                    <span className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-surface text-text-primary">
                      <GlobeIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary">공개 방</span>
                      <span className="mt-1 block text-xs leading-5 text-text-secondary">
                        링크를 받은 사용자가 바로 입장할 수 있습니다.
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                      onClick={() => {
                        updateState("visibility", "private");
                      }}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                        state.visibility === "private"
                          ? "border-violet-300 bg-violet-100"
                          : "border-border bg-surface",
                    )}
                  >
                    <span className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-surface text-text-primary">
                      <LockIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary">비공개 방</span>
                      <span className="mt-1 block text-xs leading-5 text-text-secondary">
                        비밀번호를 입력한 사람만 입장할 수 있습니다.
                      </span>
                    </span>
                  </button>
                </div>

                {state.visibility === "private" ? (
                  <div className="space-y-2">
                    <FieldLabel>비밀번호</FieldLabel>
                    <input
                      type="password"
                      value={state.password}
                      onChange={(event) => {
                        updateState("password", event.target.value);
                      }}
                      placeholder="4자 이상 입력"
                      className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-text-primary outline-none transition focus:border-violet-300"
                    />
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">참여 링크</p>
                      <p className="mt-2 break-all text-sm leading-6 text-text-secondary">
                        {inviteLink}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyInviteLink}
                      className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
                    >
                      <CopyIcon />
                      <span>{copied ? "복사 완료" : "링크 복사"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  {partyParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary">{participant.name}</p>
                        <p className="mt-1 text-xs text-text-secondary">{participant.status}</p>
                      </div>
                      <StatusChip tone="muted">연결 준비</StatusChip>
                    </div>
                  ))}
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
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <SearchIcon />
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setHighlightedSearchIndex(-1);
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
                                if (streamer.isParticipant) {
                                  return;
                                }

                                addParticipant(streamer.id);
                              }}
                              className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                                streamer.isParticipant && "cursor-default opacity-80",
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
                    <StatusChip tone="muted">{participantStreamers.length}명 선택됨</StatusChip>
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
                      runAutoPlacement(state.tournamentId);
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
                    const fillCount = state.board[line.key].slice(0, visibleColumnCount).filter(Boolean).length;

                    return [
                      <div
                        key={`${line.key}-label`}
                        className="flex items-center rounded-2xl bg-surface-muted px-3 py-3"
                        >
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {fillCount} / {visibleColumnCount} 배치
                          </p>
                        </div>
                      </div>,
                      ...state.board[line.key].slice(0, visibleColumnCount).map((streamerId, index) => (
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
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                      <p className="text-xs font-semibold text-text-secondary">
                        {state.board[line.key].slice(0, visibleColumnCount).filter(Boolean).length} / {visibleColumnCount} 배치
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {state.board[line.key].slice(0, visibleColumnCount).map((streamerId, index) => (
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

              <div className="flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                  <p className="text-sm font-semibold text-text-primary">
                    {remainingRequiredCount === 0
                      ? "현재 설정 기준 필수 인원 배치가 완료됐습니다."
                      : `${remainingRequiredCount}명 더 배치하면 현재 설정 기준을 충족합니다.`}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    실제 방 생성 조건은 현재 설정한 팀 수와 팀당 인원을 기준으로 계산됩니다.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canCreateRoom}
                  className={cn(
                    "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition-colors",
                    canCreateRoom
                      ? "cursor-pointer bg-text-primary text-text-inverse"
                      : "cursor-not-allowed bg-surface-muted text-text-muted",
                  )}
                >
                  <span>{isPartyMode ? "방 생성하기" : "혼자 시작하기"}</span>
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

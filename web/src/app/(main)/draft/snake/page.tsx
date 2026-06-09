"use client";

import {
  DraftRoomHeader,
  DraftRoomSectionCard,
  DraftRoomStatusChip,
} from "@/components/draft/room";
import { DraftStreamerCard } from "@/components/draft/streamer-card";
import { STREAMER_DIRECTORY_BY_ID, draftLineLabelMap, draftLineRows } from "@/constants/draft";
import type { LolLineKey } from "@/types/draft";
import { cn, parseDraftRoomSnapshot, serializeDraftRoomSnapshot } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type DragEvent } from "react";

interface PoolSelection {
  id: string;
  line: LolLineKey;
}

interface PlacementSelection extends PoolSelection {
  sourcePickNumber?: number;
}

interface SnakeDraftTeamHeader {
  avatarDataUrl?: string;
  subtitle?: string;
  title: string;
}

const presetTeamHeaderFallbackMap: Record<
  string,
  {
    coach: string[];
    headCoach: string[];
  }
> = {
  "pickz-invitational": {
    coach: ["엄티", "로컨", "노페", "플라이"],
    headCoach: ["마린", "베릴", "인간젤리", "큐베"],
  },
};

function UndoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M8 5 4 9l4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9h7a4 4 0 0 1 0 8H9.5"
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

function buildSnakeOrder(teamCount: number, roundCount: number) {
  return Array.from({ length: roundCount }, (_, roundIndex) => {
    const teamIndices = Array.from({ length: teamCount }, (_, teamIndex) => teamIndex);

    if (roundIndex % 2 === 1) {
      teamIndices.reverse();
    }

    return teamIndices;
  });
}

type BoardAssignments = Partial<Record<number, PoolSelection>>;

function buildSnakePickBoard(
  teamHeaders: SnakeDraftTeamHeader[],
  snakeOrderByRound: number[][],
  boardAssignments: BoardAssignments,
) {
  return teamHeaders.map((teamHeader, teamIndex) => ({
    id: `team-${teamIndex + 1}`,
    teamHeader,
    picks: snakeOrderByRound.map((roundOrder, roundIndex) => {
      const pickOrderInRound = roundOrder.indexOf(teamIndex);
      const absolutePickIndex = roundIndex * roundOrder.length + pickOrderInRound;
      const absolutePickNumber = absolutePickIndex + 1;
      const assignment = boardAssignments[absolutePickNumber] ?? null;

      return {
        absolutePickNumber,
        assignment,
        line: assignment?.line ?? null,
        roundIndex,
        streamer: assignment ? (STREAMER_DIRECTORY_BY_ID.get(assignment.id) ?? null) : null,
      };
    }),
  }));
}

function findPlacedPickNumber(assignments: BoardAssignments, streamerId: string) {
  const matchedEntry = Object.entries(assignments).find(
    ([, assignment]) => assignment?.id === streamerId,
  );

  return matchedEntry ? Number(matchedEntry[0]) : null;
}

function cloneAssignments(assignments: BoardAssignments): BoardAssignments {
  const nextAssignments: BoardAssignments = {};

  Object.entries(assignments).forEach(([pickNumber, assignment]) => {
    if (!assignment) {
      return;
    }

    nextAssignments[Number(pickNumber)] = {
      ...assignment,
    };
  });

  return nextAssignments;
}

function TeamHeaderBlock({ avatarDataUrl, subtitle, title }: SnakeDraftTeamHeader) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 text-center">
      {avatarDataUrl ? (
        <Image
          src={avatarDataUrl}
          alt=""
          width={32}
          height={32}
          className="size-8 rounded-full border border-border bg-surface object-cover"
        />
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
        {subtitle ? <p className="truncate text-[11px] text-text-secondary">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function resolvePresetTeamHeaderFallback(
  tournamentId: string,
  line: "coach" | "headCoach",
  teamIndex: number,
) {
  return presetTeamHeaderFallbackMap[tournamentId]?.[line]?.[teamIndex] ?? null;
}

function SnakeDraftRoomPage() {
  const searchParams = useSearchParams();
  const snapshot = useMemo(
    () => parseDraftRoomSnapshot(searchParams.get("config")),
    [searchParams],
  );
  const [boardAssignments, setBoardAssignments] = useState<BoardAssignments>({});
  const [assignmentHistory, setAssignmentHistory] = useState<BoardAssignments[]>([]);
  const [draggingSelection, setDraggingSelection] = useState<PlacementSelection | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementSelection | null>(null);
  const [hoveredPickNumber, setHoveredPickNumber] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const syncViewport = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobileViewport(nextIsMobile);

      if (!nextIsMobile) {
        setSelectedPlacement(null);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  if (!snapshot) {
    return (
      <main className="min-h-[calc(100dvh-var(--header-height))] bg-slate-50 px-4 py-5 sm:px-6 xl:px-8">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">
            드래프트 정보를 불러오지 못했습니다.
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            방 설정에서 다시 생성해 주세요.
          </p>
          <Link
            href="/draft/create/streamers"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
          >
            <Image
              src="/icons/arrow_back.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="size-4"
            />
            <span>방 설정으로 돌아가기</span>
          </Link>
        </section>
      </main>
    );
  }

  const playerLines = draftLineRows.filter(
    ({ key }) =>
      key === "top" || key === "jungle" || key === "mid" || key === "adc" || key === "support",
  );
  const teamCount = Number(snapshot.teamCount);
  const snakeOrderByRound = buildSnakeOrder(teamCount, playerLines.length);
  const teamHeaders = Array.from({ length: teamCount }, (_, teamIndex) => {
    const headCoachId = snapshot.board.headCoach?.[teamIndex] ?? null;
    const coachId = snapshot.board.coach?.[teamIndex] ?? null;
    const headCoach = headCoachId ? (STREAMER_DIRECTORY_BY_ID.get(headCoachId) ?? null) : null;
    const coach = coachId ? (STREAMER_DIRECTORY_BY_ID.get(coachId) ?? null) : null;
    const headCoachFallbackName = resolvePresetTeamHeaderFallback(
      snapshot.tournamentId,
      "headCoach",
      teamIndex,
    );
    const coachFallbackName = resolvePresetTeamHeaderFallback(
      snapshot.tournamentId,
      "coach",
      teamIndex,
    );
    const headCoachName = headCoach?.name ?? headCoachFallbackName;
    const coachName = coach?.name ?? coachFallbackName;

    if (headCoachName && coachName) {
      return {
        avatarDataUrl: headCoach?.avatarDataUrl ?? coach?.avatarDataUrl,
        subtitle: `(코치: ${coachName})`,
        title: headCoachName,
      };
    }

    if (headCoachName) {
      return {
        avatarDataUrl: headCoach?.avatarDataUrl,
        title: headCoachName,
      };
    }

    if (coachName) {
      return {
        avatarDataUrl: coach?.avatarDataUrl,
        title: coachName,
      };
    }

    return {
      title: `${teamIndex + 1}팀`,
    };
  });
  const snakePickBoard = buildSnakePickBoard(teamHeaders, snakeOrderByRound, boardAssignments);
  const pickedStreamerIds = Object.values(boardAssignments)
    .filter((assignment): assignment is PoolSelection => Boolean(assignment))
    .map((assignment) => assignment.id);
  const isSoloMode = snapshot.participationMode === "solo";
  const backToStreamersParams = new URLSearchParams({
    config: serializeDraftRoomSnapshot(snapshot),
    draftType: snapshot.draftType,
    mode: snapshot.participationMode,
    teamCount: snapshot.teamCount,
    teamSize: snapshot.membersPerTeam,
    tournament: snapshot.tournamentId,
  });

  if (snapshot.headCoachEnabled) {
    backToStreamersParams.set("headCoachEnabled", "true");
  }

  if (snapshot.coachEnabled) {
    backToStreamersParams.set("coachEnabled", "true");
  }

  const backToStreamersHref = `/draft/create/streamers?${backToStreamersParams.toString()}`;

  const availablePoolByLine = playerLines.map(({ key, label }) => ({
    key,
    label,
    streamers: snapshot.board[key]
      .slice(0, teamCount)
      .map((streamerId) => (streamerId ? STREAMER_DIRECTORY_BY_ID.get(streamerId) : null))
      .filter((streamer): streamer is NonNullable<typeof streamer> => Boolean(streamer)),
  }));

  const applyBoardAssignments = (updater: (current: BoardAssignments) => BoardAssignments) => {
    setBoardAssignments((currentAssignments) => {
      const nextAssignments = updater(currentAssignments);

      if (JSON.stringify(currentAssignments) === JSON.stringify(nextAssignments)) {
        return currentAssignments;
      }

      setAssignmentHistory((currentHistory) => [
        ...currentHistory,
        cloneAssignments(currentAssignments),
      ]);
      return nextAssignments;
    });
    setDraggingSelection(null);
    setSelectedPlacement(null);
    setHoveredPickNumber(null);
  };

  const placeSelectionIntoSlot = (selection: PlacementSelection, destinationPickNumber: number) => {
    applyBoardAssignments((currentAssignments) => {
      const sourcePickNumber =
        selection.sourcePickNumber ?? findPlacedPickNumber(currentAssignments, selection.id);

      if (sourcePickNumber === destinationPickNumber) {
        return currentAssignments;
      }

      const nextAssignments: BoardAssignments = { ...currentAssignments };
      const destinationAssignment = currentAssignments[destinationPickNumber] ?? null;

      if (sourcePickNumber !== null) {
        delete nextAssignments[sourcePickNumber];
      }

      nextAssignments[destinationPickNumber] = {
        id: selection.id,
        line: selection.line,
      };

      if (
        destinationAssignment &&
        sourcePickNumber !== null &&
        destinationAssignment.id !== selection.id
      ) {
        nextAssignments[sourcePickNumber] = destinationAssignment;
      }

      return nextAssignments;
    });
  };

  const handleUndoPick = () => {
    const previousAssignments = assignmentHistory.at(-1);

    if (!previousAssignments) {
      return;
    }

    setBoardAssignments(cloneAssignments(previousAssignments));
    setAssignmentHistory((currentHistory) => currentHistory.slice(0, -1));
    setDraggingSelection(null);
    setSelectedPlacement(null);
    setHoveredPickNumber(null);
  };

  const handleResetDraft = () => {
    if (Object.keys(boardAssignments).length === 0) {
      return;
    }

    applyBoardAssignments(() => ({}));
  };

  const handleRemoveFromSlot = (pickNumber: number) => {
    applyBoardAssignments((currentAssignments) => {
      if (!currentAssignments[pickNumber]) {
        return currentAssignments;
      }

      const nextAssignments = { ...currentAssignments };
      delete nextAssignments[pickNumber];
      return nextAssignments;
    });
  };

  const handleSelectionDragStart = (
    event: DragEvent<HTMLDivElement>,
    selection: PlacementSelection,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(selection));
    setDraggingSelection(selection);
  };

  const handleSelectionDragEnd = () => {
    setDraggingSelection(null);
    setHoveredPickNumber(null);
  };

  const handleBoardSlotDragOver = (event: DragEvent<HTMLDivElement>, pickNumber: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setHoveredPickNumber(pickNumber);
  };

  const handleBoardSlotDrop = (event: DragEvent<HTMLDivElement>, pickNumber: number) => {
    event.preventDefault();

    const droppedSelection = draggingSelection
      ? draggingSelection
      : (() => {
          try {
            return JSON.parse(event.dataTransfer.getData("text/plain")) as PoolSelection;
          } catch {
            return null;
          }
        })();

    if (!droppedSelection) {
      return;
    }

    placeSelectionIntoSlot(droppedSelection, pickNumber);
  };

  const handleBoardSlotTap = (pickNumber: number, selection: PlacementSelection | null) => {
    if (!isMobileViewport) {
      return;
    }

    if (!selectedPlacement) {
      if (!selection) {
        return;
      }

      setSelectedPlacement({
        id: selection.id,
        line: selection.line,
        sourcePickNumber: pickNumber,
      });
      return;
    }

    placeSelectionIntoSlot(selectedPlacement, pickNumber);
  };

  return (
    <main className="overflow-y-auto bg-slate-50 px-3 py-3 sm:px-5 lg:h-[calc(100dvh-var(--header-height))] lg:overflow-hidden xl:px-6">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2.5 lg:h-full">
        <DraftRoomHeader
          action={
            isSoloMode ? (
              <>
                <button
                  type="button"
                  onClick={handleUndoPick}
                  disabled={assignmentHistory.length === 0}
                  className={cn(
                    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors",
                    assignmentHistory.length === 0
                      ? "cursor-not-allowed border-border bg-surface text-text-muted"
                      : "cursor-pointer border-border bg-surface text-text-primary",
                  )}
                >
                  <UndoIcon />
                  <span>직전 픽 취소</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDraft}
                  disabled={Object.keys(boardAssignments).length === 0}
                  className={cn(
                    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors",
                    Object.keys(boardAssignments).length === 0
                      ? "cursor-not-allowed border-border bg-surface text-text-muted"
                      : "cursor-pointer border-border bg-surface text-text-primary",
                  )}
                >
                  <RefreshIcon />
                  <span>전체 다시 시작</span>
                </button>
              </>
            ) : undefined
          }
          backHref={isSoloMode ? backToStreamersHref : undefined}
          backLabel="방 설정으로 돌아가기"
          description="왼쪽 스트리머 풀에서 현재 선택 가능한 팀 칸으로 바로 배치합니다."
          title="스네이크 드래프트"
        />

        <div className="grid min-h-0 flex-1 gap-2.5 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] xl:items-stretch">
          <DraftRoomSectionCard
            className="min-h-0 xl:h-full"
            title="라인별 스트리머 풀"
            description="데스크톱에서는 바로 드래그하고, 모바일에서는 선수를 선택한 뒤 원하는 칸을 눌러 배치합니다."
          >
            <div className="hidden h-full min-h-0 xl:block">
              <div
                className="grid h-full gap-1"
                style={{
                  gridTemplateColumns: `54px repeat(${teamCount}, minmax(0, 1fr))`,
                  gridTemplateRows: `24px repeat(${availablePoolByLine.length}, minmax(0, 1fr))`,
                }}
              >
                <div />
                {Array.from({ length: teamCount }, (_, index) => (
                  <div
                    key={`snake-slot-header-${index + 1}`}
                    className="flex h-6 items-center justify-center rounded-lg bg-surface-muted px-1.5 text-sm font-semibold text-text-secondary"
                  >
                    슬롯 {index + 1}
                  </div>
                ))}

                {availablePoolByLine.flatMap((lineGroup) => {
                  const remainingCount = lineGroup.streamers.filter(
                    (streamer) => !pickedStreamerIds.includes(streamer.id),
                  ).length;

                  return [
                    <div
                      key={`${lineGroup.key}-label`}
                      className="flex h-full items-center justify-center rounded-lg bg-surface-muted px-2 py-1.5 text-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{lineGroup.label}</p>
                        <p className="mt-0.5 text-[10px] text-text-secondary">
                          남은 {remainingCount}명
                        </p>
                      </div>
                    </div>,
                    ...lineGroup.streamers.map((streamer) => {
                      const selection = { id: streamer.id, line: lineGroup.key };
                      const alreadyPicked = pickedStreamerIds.includes(streamer.id);
                      const disabled = alreadyPicked;

                      return (
                        <div key={streamer.id} className={cn(disabled ? "opacity-50" : "")}>
                          <DraftStreamerCard
                            avatarDataUrl={streamer.avatarDataUrl}
                            className="h-full rounded-lg p-1"
                            interaction={disabled ? "static" : isMobileViewport ? "select" : "drag"}
                            name={streamer.name}
                            onClick={() => {
                              if (!disabled && isMobileViewport) {
                                setSelectedPlacement((current) =>
                                  current?.id === streamer.id ? null : selection,
                                );
                              }
                            }}
                            onDragStart={(event) => {
                              if (!disabled) {
                                handleSelectionDragStart(event, selection);
                              }
                            }}
                            onDragEnd={handleSelectionDragEnd}
                            size="snake"
                            tone={
                              selectedPlacement?.id === streamer.id ||
                              draggingSelection?.id === streamer.id
                                ? "active"
                                : alreadyPicked
                                  ? "drop"
                                  : "default"
                            }
                          />
                        </div>
                      );
                    }),
                  ];
                })}
              </div>
            </div>

            <div className="space-y-3 xl:hidden">
              {availablePoolByLine.map((lineGroup) => {
                const remainingCount = lineGroup.streamers.filter(
                  (streamer) => !pickedStreamerIds.includes(streamer.id),
                ).length;

                return (
                  <section
                    key={lineGroup.key}
                    className="rounded-3xl border border-border bg-surface-muted p-4"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{lineGroup.label}</p>
                        <p className="mt-1 text-xs text-text-secondary">남은 {remainingCount}명</p>
                      </div>
                      <DraftRoomStatusChip tone="muted">
                        {draftLineLabelMap[lineGroup.key]}
                      </DraftRoomStatusChip>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {lineGroup.streamers.map((streamer) => {
                        const selection = { id: streamer.id, line: lineGroup.key };
                        const alreadyPicked = pickedStreamerIds.includes(streamer.id);
                        const disabled = alreadyPicked;

                        return (
                          <div key={streamer.id} className={cn(disabled ? "opacity-50" : "")}>
                            <DraftStreamerCard
                              avatarDataUrl={streamer.avatarDataUrl}
                              className="h-full"
                              interaction={disabled ? "static" : "select"}
                              name={streamer.name}
                              onClick={() => {
                                if (!disabled) {
                                  setSelectedPlacement((current) =>
                                    current?.id === streamer.id ? null : selection,
                                  );
                                }
                              }}
                              size="slot"
                              tone={
                                selectedPlacement?.id === streamer.id
                                  ? "active"
                                  : alreadyPicked
                                    ? "drop"
                                    : "default"
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </DraftRoomSectionCard>

          <DraftRoomSectionCard
            className="min-h-0 xl:h-full"
            title="팀 배치"
            description="현재 선택 가능한 칸만 활성화됩니다."
          >
            <div className="hidden h-full min-h-0 xl:block">
              <div
                className="grid h-full gap-1.5"
                style={{
                  gridTemplateColumns: `96px repeat(${playerLines.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${teamCount}, minmax(0, 1fr))`,
                }}
              >
                {snakePickBoard.flatMap((teamRow) => [
                  <div
                    key={`${teamRow.id}-label`}
                    className="flex h-full items-center rounded-lg bg-surface-muted px-2 py-2"
                  >
                    <div
                      className={cn(
                        "w-full",
                        selectedPlacement &&
                          teamRow.picks.some(
                            (pick) =>
                              pick.absolutePickNumber === selectedPlacement.sourcePickNumber,
                          )
                          ? "text-violet-700"
                          : "",
                      )}
                    >
                      <TeamHeaderBlock {...teamRow.teamHeader} />
                    </div>
                  </div>,
                  ...teamRow.picks.map((pick) => {
                    const isHovered = hoveredPickNumber === pick.absolutePickNumber;
                    const selectedFromThisSlot =
                      selectedPlacement?.sourcePickNumber === pick.absolutePickNumber;
                    const slotSelection =
                      pick.assignment && pick.line
                        ? {
                            id: pick.assignment.id,
                            line: pick.line,
                            sourcePickNumber: pick.absolutePickNumber,
                          }
                        : null;

                    return (
                      <div
                        key={`${teamRow.id}-pick-${pick.absolutePickNumber}`}
                        onClick={() => {
                          handleBoardSlotTap(pick.absolutePickNumber, slotSelection);
                        }}
                        onDragOver={(event) => {
                          handleBoardSlotDragOver(event, pick.absolutePickNumber);
                        }}
                        onDragEnter={(event) => {
                          event.preventDefault();
                          setHoveredPickNumber(pick.absolutePickNumber);
                        }}
                        onDragLeave={() => {
                          if (hoveredPickNumber === pick.absolutePickNumber) {
                            setHoveredPickNumber(null);
                          }
                        }}
                        onDrop={(event) => {
                          handleBoardSlotDrop(event, pick.absolutePickNumber);
                        }}
                        className={cn(
                          "relative h-full overflow-hidden rounded-lg border p-1 transition-colors",
                          isMobileViewport || draggingSelection
                            ? "cursor-pointer"
                            : "cursor-default",
                          pick.streamer
                            ? "border-violet-200 bg-violet-50 shadow-sm"
                            : "border-border bg-surface",
                          isHovered || selectedFromThisSlot
                            ? "border-violet-300 bg-violet-50 shadow-sm"
                            : "",
                        )}
                      >
                        {pick.streamer ? (
                          <div className="flex h-full items-center justify-center">
                            <DraftStreamerCard
                              avatarDataUrl={pick.streamer.avatarDataUrl}
                              className="h-full w-full rounded-md border-violet-200 bg-surface p-1 shadow-sm"
                              helperText={pick.line ? draftLineLabelMap[pick.line] : undefined}
                              interaction={isMobileViewport ? "select" : "drag"}
                              name={pick.streamer.name}
                              onClick={() => {
                                if (slotSelection) {
                                  handleBoardSlotTap(pick.absolutePickNumber, slotSelection);
                                }
                              }}
                              onDragStart={(event) => {
                                if (!isMobileViewport && slotSelection) {
                                  handleSelectionDragStart(event, slotSelection);
                                }
                              }}
                              onDragEnd={handleSelectionDragEnd}
                              onRemove={() => {
                                handleRemoveFromSlot(pick.absolutePickNumber);
                              }}
                              removeLabel={`${pick.streamer.name} 제거`}
                              size="snake"
                              tone={selectedFromThisSlot ? "active" : "default"}
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "flex h-full items-center justify-center rounded-md border border-dashed",
                              isHovered
                                ? "border-violet-300 bg-violet-100"
                                : "border-border bg-surface-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "text-[1.75rem] font-bold tracking-[-0.06em]",
                                isHovered ? "text-slate-500" : "text-slate-400",
                              )}
                            >
                              {pick.absolutePickNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }),
                ])}
              </div>
            </div>

            <div className="space-y-3 xl:hidden">
              {snakePickBoard.map((teamRow) => (
                <article
                  key={`${teamRow.id}-mobile`}
                  className="rounded-3xl border border-border bg-surface-muted p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={cn(
                        "min-w-0",
                        selectedPlacement &&
                          teamRow.picks.some(
                            (pick) =>
                              pick.absolutePickNumber === selectedPlacement.sourcePickNumber,
                          )
                          ? "text-violet-700"
                          : "text-text-primary",
                      )}
                    >
                      <TeamHeaderBlock {...teamRow.teamHeader} />
                    </div>
                    <p className="text-xs text-text-secondary">
                      {teamRow.picks.filter((pick) => Boolean(pick.streamer)).length} /{" "}
                      {playerLines.length}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {teamRow.picks.map((pick) => {
                      const selectedFromThisSlot =
                        selectedPlacement?.sourcePickNumber === pick.absolutePickNumber;
                      const slotSelection =
                        pick.assignment && pick.line
                          ? {
                              id: pick.assignment.id,
                              line: pick.line,
                              sourcePickNumber: pick.absolutePickNumber,
                            }
                          : null;

                      return (
                        <div
                          key={`${teamRow.id}-mobile-pick-${pick.absolutePickNumber}`}
                          onClick={() => {
                            handleBoardSlotTap(pick.absolutePickNumber, slotSelection);
                          }}
                          className={cn(
                            "relative aspect-square cursor-pointer overflow-hidden rounded-2xl border p-2 text-left transition-colors",
                            pick.streamer
                              ? "border-violet-200 bg-violet-50 shadow-sm"
                              : "border-border bg-surface",
                            selectedFromThisSlot ? "border-violet-300 bg-violet-50 shadow-sm" : "",
                          )}
                        >
                          {pick.streamer ? (
                            <div className="flex h-full items-center justify-center">
                              <DraftStreamerCard
                                avatarDataUrl={pick.streamer.avatarDataUrl}
                                className="h-full w-full rounded-xl border-violet-200 bg-surface p-1 shadow-sm"
                                helperText={pick.line ? draftLineLabelMap[pick.line] : undefined}
                                interaction="select"
                                name={pick.streamer.name}
                                onClick={() => {
                                  if (slotSelection) {
                                    handleBoardSlotTap(pick.absolutePickNumber, slotSelection);
                                  }
                                }}
                                onRemove={() => {
                                  handleRemoveFromSlot(pick.absolutePickNumber);
                                }}
                                removeLabel={`${pick.streamer.name} 제거`}
                                size="snake"
                                tone={selectedFromThisSlot ? "active" : "default"}
                              />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "flex h-full items-center justify-center rounded-xl border border-dashed",
                                selectedPlacement
                                  ? "border-violet-300 bg-violet-100"
                                  : "border-border bg-surface-muted",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-4xl font-bold tracking-[-0.06em]",
                                  selectedPlacement ? "text-slate-500" : "text-slate-400",
                                )}
                              >
                                {pick.absolutePickNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </DraftRoomSectionCard>
        </div>
      </div>
    </main>
  );
}

export default function SnakeDraftPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
          <section className="rounded-3xl border border-border bg-surface p-6 text-sm font-semibold text-text-secondary shadow-sm">
            드래프트 정보를 불러오는 중입니다.
          </section>
        </main>
      }
    >
      <SnakeDraftRoomPage />
    </Suspense>
  );
}

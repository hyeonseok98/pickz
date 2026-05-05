"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { DraftStreamerCard } from "@/components/draft/streamer-card";
import { STREAMER_DIRECTORY_BY_ID } from "@/constants/streamers";
import {
  cn,
  draftLineLabelMap,
  getActiveDraftLines,
  parseDraftRoomSnapshot,
  type LineKey,
} from "@/utils";

interface PoolSelection {
  id: string;
  line: LineKey;
}

interface PlacementSelection extends PoolSelection {
  sourcePickNumber?: number;
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

function StatusChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "active" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
        tone === "active"
          ? "border-violet-300 bg-violet-100 text-violet-700"
          : tone === "muted"
            ? "border-border bg-surface-muted text-text-secondary"
            : "border-border bg-surface text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-4.5",
        className,
      )}
    >
      <div className="shrink-0">
        <h2 className="text-base font-bold tracking-[-0.03em] text-text-primary sm:text-lg">{title}</h2>
        <p className="mt-1.5 text-xs leading-5 text-text-secondary">{description}</p>
      </div>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
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
  teamNames: string[],
  snakeOrderByRound: number[][],
  boardAssignments: BoardAssignments,
) {
  return teamNames.map((teamName, teamIndex) => ({
    id: `team-${teamIndex + 1}`,
    name: teamName ?? `${teamIndex + 1}팀`,
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
        streamer: assignment ? STREAMER_DIRECTORY_BY_ID.get(assignment.id) ?? null : null,
      };
    }),
  }));
}

function findPlacedPickNumber(assignments: BoardAssignments, streamerId: string) {
  const matchedEntry = Object.entries(assignments).find(([, assignment]) => assignment?.id === streamerId);

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

export default function SnakeDraftPage() {
  const searchParams = useSearchParams();
  const snapshot = useMemo(() => parseDraftRoomSnapshot(searchParams.get("config")), [searchParams]);
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
            href="/draft/create"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
          >
            <ArrowLeftIcon />
            <span>방 설정으로 돌아가기</span>
          </Link>
        </section>
      </main>
    );
  }

  const activeLines = getActiveDraftLines(snapshot.membersPerTeam);
  const teamCount = Number(snapshot.teamCount);
  const snakeOrderByRound = buildSnakeOrder(teamCount, activeLines.length);
  const teamNames = Array.from({ length: teamCount }, (_, teamIndex) =>
    snapshot.participationMode === "party"
      ? snapshot.joinedParticipantNames[teamIndex] ?? `${teamIndex + 1}팀`
      : `${teamIndex + 1}팀`,
  );
  const snakePickBoard = buildSnakePickBoard(teamNames, snakeOrderByRound, boardAssignments);
  const pickedIdSet = new Set(
    Object.values(boardAssignments)
      .filter((assignment): assignment is PoolSelection => Boolean(assignment))
      .map((assignment) => assignment.id),
  );
  const isSoloMode = snapshot.participationMode === "solo";

  const availablePoolByLine = activeLines.map(({ key, label }) => ({
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
    <main className="overflow-y-auto bg-slate-50 px-3 py-3 sm:px-5 xl:px-6 lg:h-[calc(100dvh-var(--header-height))] lg:overflow-hidden">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2.5 lg:h-full">
        <section className="shrink-0 rounded-3xl border border-border bg-surface px-4 py-2.5 shadow-sm sm:px-5 sm:py-3">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              {isSoloMode ? (
                <Link
                  href={`/draft/create?type=${snapshot.draftType}&mode=${snapshot.participationMode}&tournament=${snapshot.tournamentId}`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary"
                >
                  <ArrowLeftIcon />
                  <span>방 설정으로 돌아가기</span>
                </Link>
              ) : null}

              <h1 className={cn("font-bold tracking-[-0.04em] text-text-primary", isSoloMode ? "mt-2.5 text-[28px]" : "text-[28px]")}>
                스네이크 드래프트
              </h1>
              <p className="mt-1 text-xs leading-4.5 text-text-secondary">
                왼쪽 스트리머 풀에서 현재 선택 가능한 팀 칸으로 바로 배치합니다.
              </p>
            </div>

            {isSoloMode ? (
              <div className="flex flex-wrap gap-2 xl:justify-end">
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
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-2.5 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] xl:items-stretch">
          <SectionCard
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
                  const remainingCount = lineGroup.streamers.filter((streamer) => !pickedIdSet.has(streamer.id)).length;

                  return [
                    <div
                      key={`${lineGroup.key}-label`}
                      className="flex h-full items-center justify-center rounded-lg bg-surface-muted px-2 py-1.5 text-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{lineGroup.label}</p>
                        <p className="mt-0.5 text-[10px] text-text-secondary">남은 {remainingCount}명</p>
                      </div>
                    </div>,
                    ...lineGroup.streamers.map((streamer) => {
                      const selection = { id: streamer.id, line: lineGroup.key };
                      const alreadyPicked = pickedIdSet.has(streamer.id);
                      const disabled = alreadyPicked;

                      return (
                        <div
                          key={streamer.id}
                          className={cn(disabled ? "opacity-50" : "")}
                        >
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
                const remainingCount = lineGroup.streamers.filter((streamer) => !pickedIdSet.has(streamer.id)).length;

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
                      <StatusChip tone="muted">{draftLineLabelMap[lineGroup.key]}</StatusChip>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {lineGroup.streamers.map((streamer) => {
                        const selection = { id: streamer.id, line: lineGroup.key };
                        const alreadyPicked = pickedIdSet.has(streamer.id);
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
          </SectionCard>

          <SectionCard
            className="min-h-0 xl:h-full"
            title="팀 배치"
            description="현재 선택 가능한 칸만 활성화됩니다."
          >
            <div className="hidden h-full min-h-0 xl:block">
              <div
                className="grid h-full gap-1.5"
                style={{
                  gridTemplateColumns: `48px repeat(${activeLines.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${teamCount}, minmax(0, 1fr))`,
                }}
              >
                {snakePickBoard.flatMap((teamRow, teamIndex) => [
                  <div
                    key={`${teamRow.id}-label`}
                    className="flex h-full items-center justify-center rounded-lg bg-surface-muted px-1 text-center"
                  >
                    <span
                      className={cn(
                        "text-base font-bold tracking-[-0.05em]",
                        selectedPlacement &&
                        teamRow.picks.some((pick) => pick.absolutePickNumber === selectedPlacement.sourcePickNumber)
                          ? "text-violet-700"
                          : "text-text-primary",
                      )}
                    >
                      {teamIndex + 1}팀
                    </span>
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
                          "relative h-full rounded-lg border p-1 transition-colors overflow-hidden",
                          isMobileViewport || draggingSelection ? "cursor-pointer" : "cursor-default",
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
              {snakePickBoard.map((teamRow, teamIndex) => (
                <article
                  key={`${teamRow.id}-mobile`}
                  className="rounded-3xl border border-border bg-surface-muted p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      className={cn(
                        "text-lg font-bold tracking-[-0.04em]",
                        selectedPlacement &&
                        teamRow.picks.some((pick) => pick.absolutePickNumber === selectedPlacement.sourcePickNumber)
                          ? "text-violet-700"
                          : "text-text-primary",
                      )}
                    >
                      {teamIndex + 1}팀
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {teamRow.picks.filter((pick) => Boolean(pick.streamer)).length} / {activeLines.length}
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
                            "relative aspect-square rounded-2xl border p-2 text-left transition-colors overflow-hidden cursor-pointer",
                            pick.streamer
                              ? "border-violet-200 bg-violet-50 shadow-sm"
                              : "border-border bg-surface",
                            selectedFromThisSlot
                              ? "border-violet-300 bg-violet-50 shadow-sm"
                              : "",
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
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

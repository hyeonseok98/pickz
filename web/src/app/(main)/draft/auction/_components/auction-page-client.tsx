"use client";

import { Button, SectionCard } from "@/components/common/ui";
import {
  auctionAnnounceCountdownSeconds,
  auctionBiddingSeconds,
  auctionInitialStandbySeconds,
  auctionMaxReauctionCount,
  auctionRoundResultWaitSeconds,
} from "@/constants/draft";
import type {
  AuctionChatMessage,
  AuctionPageState,
  AuctionPhase,
  AuctionStreamer,
  AuctionTeamState,
} from "@/types/draft";
import {
  applyAuctionSoldResult,
  createAuctionLogTime,
  createAuctionTurnAnnouncement,
  resetAuctionTeamStates,
  shuffleAuctionStreamers,
  validateAuctionBidAmount,
} from "@/utils/draft/auction";
import { useCallback, useEffect, useState } from "react";
import { AuctionBidControlPanel } from "./auction-bid-control-panel";
import { AuctionBidLogSection } from "./auction-bid-log-section";
import { AuctionMainStageSection } from "./auction-main-stage-section";
import { AuctionStreamerQueueSection } from "./auction-streamer-queue-section";
import { AuctionTeamRosterSection } from "./auction-team-roster-section";
import { AuctionUnsoldStreamerSection } from "./auction-unsold-streamer-section";

interface AuctionPageClientProps {
  initialAuctionPageState: AuctionPageState;
}

interface CurrentHighestBid {
  amount: number;
  teamId: number;
  teamName: string;
}

function moveTeamOrder(
  teamStates: AuctionTeamState[],
  teamIndex: number,
  direction: "down" | "up",
) {
  const targetIndex = direction === "up" ? teamIndex - 1 : teamIndex + 1;

  if (targetIndex < 0 || targetIndex >= teamStates.length) {
    return teamStates;
  }

  const nextTeamStates = [...teamStates];
  [nextTeamStates[teamIndex], nextTeamStates[targetIndex]] = [
    nextTeamStates[targetIndex],
    nextTeamStates[teamIndex],
  ];

  return nextTeamStates;
}

function moveDraggedTeamOrder(
  teamStates: AuctionTeamState[],
  draggedTeamId: number,
  targetTeamId: number,
) {
  const draggedTeamIndex = teamStates.findIndex((teamState) => teamState.teamId === draggedTeamId);
  const targetTeamIndex = teamStates.findIndex((teamState) => teamState.teamId === targetTeamId);

  if (draggedTeamIndex < 0 || targetTeamIndex < 0 || draggedTeamIndex === targetTeamIndex) {
    return teamStates;
  }

  const nextTeamStates = [...teamStates];
  const [draggedTeamState] = nextTeamStates.splice(draggedTeamIndex, 1);

  if (!draggedTeamState) {
    return teamStates;
  }

  nextTeamStates.splice(targetTeamIndex, 0, draggedTeamState);

  return nextTeamStates;
}

function getTeamStaffDescription(teamState: AuctionTeamState) {
  const headCoachName = teamState.staff.headCoach?.name;
  const coachName = teamState.staff.coach?.name;

  if (headCoachName && coachName) {
    return `${headCoachName} / 코치 ${coachName}`;
  }

  return headCoachName ?? coachName ?? `${teamState.teamId}팀`;
}

function createAuctionLog(message: string, type: AuctionChatMessage["type"] = "system") {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    message,
    sentAt: createAuctionLogTime(),
    type,
  };
}

export function AuctionPageClient({ initialAuctionPageState }: AuctionPageClientProps) {
  const [auctionOrder, setAuctionOrder] = useState(initialAuctionPageState.upcomingStreamers);
  const [remainingAuctionQueue, setRemainingAuctionQueue] = useState(
    initialAuctionPageState.upcomingStreamers,
  );
  const [currentStreamer, setCurrentStreamer] = useState<AuctionStreamer | null>(null);
  const [currentPhase, setCurrentPhase] = useState<AuctionPhase>("STANDBY");
  const [remainSeconds, setRemainSeconds] = useState(auctionInitialStandbySeconds);
  const [currentHighestBid, setCurrentHighestBid] = useState<CurrentHighestBid | null>(null);
  const [unbidStreamers, setUnbidStreamers] = useState(initialAuctionPageState.unbidStreamers);
  const [teamStates, setTeamStates] = useState(initialAuctionPageState.teamStates);
  const [auctionLogs, setAuctionLogs] = useState(initialAuctionPageState.logs);
  const [isCoachOrderPanelOpen, setIsCoachOrderPanelOpen] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [reauctionCount, setReauctionCount] = useState(0);
  const [draggingTeamId, setDraggingTeamId] = useState<number | null>(null);
  const hostTeam = teamStates[0];
  const queueStreamers = isGameStarted ? remainingAuctionQueue : auctionOrder;

  const appendAuctionLog = useCallback((message: string, type?: AuctionChatMessage["type"]) => {
    setAuctionLogs((currentLogs) => [...currentLogs, createAuctionLog(message, type)]);
  }, []);

  const startNextAuctionRound = useCallback(() => {
    const nextStreamer = remainingAuctionQueue[0];

    if (nextStreamer) {
      setCurrentStreamer(nextStreamer);
      setRemainingAuctionQueue(remainingAuctionQueue.slice(1));
      setCurrentHighestBid(null);
      setCurrentPhase("COUNTDOWN");
      setRemainSeconds(auctionAnnounceCountdownSeconds);
      appendAuctionLog(createAuctionTurnAnnouncement(nextStreamer));
      return;
    }

    if (unbidStreamers.length > 0 && reauctionCount < auctionMaxReauctionCount) {
      const nextReauctionStreamer = unbidStreamers[0];

      if (!nextReauctionStreamer) {
        return;
      }

      setCurrentStreamer(nextReauctionStreamer);
      setRemainingAuctionQueue(unbidStreamers.slice(1));
      setUnbidStreamers([]);
      setCurrentHighestBid(null);
      setReauctionCount((currentCount) => currentCount + 1);
      setCurrentPhase("COUNTDOWN");
      setRemainSeconds(auctionAnnounceCountdownSeconds);
      appendAuctionLog(`재경매 ${reauctionCount + 1}회차: ${createAuctionTurnAnnouncement(nextReauctionStreamer)}`);
      return;
    }

    setCurrentStreamer(null);
    setCurrentPhase("FINISHED");
    setRemainSeconds(0);
    setIsGameStarted(false);
    appendAuctionLog("경매가 종료되었습니다");
  }, [appendAuctionLog, reauctionCount, remainingAuctionQueue, unbidStreamers]);

  const finishCurrentBiddingRound = useCallback(() => {
    if (!currentStreamer) {
      startNextAuctionRound();
      return;
    }

    if (currentHighestBid) {
      setTeamStates((currentTeamStates) =>
        applyAuctionSoldResult({
          bidAmount: currentHighestBid.amount,
          streamer: currentStreamer,
          teamId: currentHighestBid.teamId,
          teamStates: currentTeamStates,
        }),
      );
      appendAuctionLog(
        `${currentHighestBid.teamName} - ${currentStreamer.name} - ${currentHighestBid.amount}포인트 낙찰`,
        "bid",
      );
    } else {
      setUnbidStreamers((currentStreamers) => [...currentStreamers, currentStreamer]);
      appendAuctionLog(`${currentStreamer.name} 유찰`);
    }

    setCurrentPhase("ROUND_RESULT");
    setRemainSeconds(auctionRoundResultWaitSeconds);
  }, [appendAuctionLog, currentHighestBid, currentStreamer, startNextAuctionRound]);

  useEffect(() => {
    if (!isGameStarted || currentPhase === "FINISHED") {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (remainSeconds > 0) {
        setRemainSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
        return;
      }

      switch (currentPhase) {
        case "STANDBY":
          startNextAuctionRound();
          return;
        case "COUNTDOWN":
          setCurrentPhase("BIDDING");
          setRemainSeconds(auctionBiddingSeconds);
          appendAuctionLog("입찰이 시작되었습니다");
          return;
        case "BIDDING":
          finishCurrentBiddingRound();
          return;
        case "ROUND_RESULT":
          startNextAuctionRound();
          return;
        case "EVALUATING":
          return;
      }
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    appendAuctionLog,
    currentPhase,
    finishCurrentBiddingRound,
    isGameStarted,
    remainSeconds,
    startNextAuctionRound,
  ]);

  const shuffleAuctionQueue = () => {
    if (isGameStarted) {
      return;
    }

    setAuctionOrder((currentOrder) => {
      const nextOrder = shuffleAuctionStreamers(currentOrder);
      setRemainingAuctionQueue(nextOrder);
      return nextOrder;
    });
  };

  const moveCoachOrder = (teamIndex: number, direction: "down" | "up") => {
    if (isGameStarted) {
      return;
    }

    setTeamStates((currentTeamStates) => moveTeamOrder(currentTeamStates, teamIndex, direction));
  };

  const moveCoachOrderByDrag = (targetTeamId: number) => {
    if (isGameStarted || draggingTeamId === null) {
      return;
    }

    setTeamStates((currentTeamStates) =>
      moveDraggedTeamOrder(currentTeamStates, draggingTeamId, targetTeamId),
    );
    setDraggingTeamId(null);
  };

  const startAuctionGame = () => {
    setCurrentStreamer(null);
    setCurrentHighestBid(null);
    setUnbidStreamers([]);
    setRemainingAuctionQueue(auctionOrder);
    setCurrentPhase("STANDBY");
    setRemainSeconds(auctionInitialStandbySeconds);
    setReauctionCount(0);
    setIsGameStarted(true);
    setIsCoachOrderPanelOpen(false);
    appendAuctionLog("게임 시작 대기 중입니다");
  };

  const resetAuctionGame = () => {
    setCurrentStreamer(null);
    setCurrentHighestBid(null);
    setUnbidStreamers([]);
    setRemainingAuctionQueue(auctionOrder);
    setTeamStates((currentTeamStates) => resetAuctionTeamStates(currentTeamStates));
    setCurrentPhase("STANDBY");
    setRemainSeconds(auctionInitialStandbySeconds);
    setReauctionCount(0);
    setIsGameStarted(false);
    setIsCoachOrderPanelOpen(false);
    appendAuctionLog("경매 대기중 상태로 돌아갔습니다");
  };

  const submitBid = (bidAmount: number) => {
    if (currentPhase !== "BIDDING" || !hostTeam || !currentStreamer) {
      return;
    }

    const validation = validateAuctionBidAmount({
      amount: bidAmount,
      currentHighestBidAmount: currentHighestBid?.amount ?? 0,
      remainingPoints: hostTeam.remainingPoints,
    });

    if (!validation.isValid) {
      return;
    }

    setCurrentHighestBid({
      amount: bidAmount,
      teamId: hostTeam.teamId,
      teamName: hostTeam.teamName,
    });
    setRemainSeconds(auctionBiddingSeconds);
    appendAuctionLog(`${hostTeam.teamName} - ${currentStreamer.name} - ${bidAmount}포인트 입찰`, "bid");
  };

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-[#f7f5ff] px-2 py-2 sm:px-3 xl:h-[calc(100dvh-var(--header-height))] xl:overflow-hidden">
      <div className="mx-auto flex w-full max-w-430 justify-center xl:h-full">
        <div className="grid w-full max-w-415 gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,26rem)_minmax(0,28.5rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,31rem)_minmax(0,30rem)_minmax(0,1fr)]">
          <AuctionTeamRosterSection
            initialPoints={initialAuctionPageState.initialTeamPoints}
            teamStates={teamStates}
          />

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,10rem)] 2xl:grid-rows-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,10rem)]">
            <AuctionMainStageSection
              currentHighestBidAmount={currentHighestBid?.amount ?? 0}
              currentHighestBidTeamName={currentHighestBid?.teamName ?? null}
              currentPhase={currentPhase}
              currentStreamer={currentStreamer}
              remainSeconds={remainSeconds}
            />

            <AuctionBidLogSection logs={auctionLogs} />
            <AuctionBidControlPanel
              currentHighestBidAmount={currentHighestBid?.amount ?? 0}
              isBidDisabled={currentPhase !== "BIDDING" || !currentStreamer}
              onSubmitBid={submitBid}
              remainingPoints={hostTeam?.remainingPoints ?? 0}
              remainSeconds={remainSeconds}
            />
          </div>

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(0,1fr)_144px]">
            <AuctionStreamerQueueSection
              isGameStarted={isGameStarted}
              onOpenCoachOrderPanel={() => {
                setIsCoachOrderPanelOpen(true);
              }}
              onResetAuctionGame={resetAuctionGame}
              onShuffleAuctionOrder={shuffleAuctionQueue}
              onStartAuctionGame={startAuctionGame}
              streamers={queueStreamers}
            />
            <AuctionUnsoldStreamerSection streamers={unbidStreamers} />
          </div>
        </div>
      </div>

      {isCoachOrderPanelOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-6">
          <SectionCard
            padding="md"
            className="w-full max-w-2xl border-violet-100 bg-white"
            title="감독 순서 변경"
            description="위에 있는 팀부터 경매 순서가 먼저 적용됩니다."
            headerEnd={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCoachOrderPanelOpen(false);
                }}
              >
                닫기
              </Button>
            }
          >
            <div className="grid gap-2">
              {teamStates.map((teamState, teamIndex) => (
                <div
                  key={teamState.teamId}
                  draggable={!isGameStarted}
                  className="grid cursor-grab grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-3 active:cursor-grabbing"
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    setDraggingTeamId(teamState.teamId);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={() => {
                    moveCoachOrderByDrag(teamState.teamId);
                  }}
                  onDragEnd={() => {
                    setDraggingTeamId(null);
                  }}
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white">
                    {teamIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-primary">{teamState.teamName}</p>
                    <p className="truncate text-sm font-semibold text-text-secondary">
                      {getTeamStaffDescription(teamState)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={teamIndex === 0}
                      onClick={() => {
                        moveCoachOrder(teamIndex, "up");
                      }}
                    >
                      위
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={teamIndex === teamStates.length - 1}
                      onClick={() => {
                        moveCoachOrder(teamIndex, "down");
                      }}
                    >
                      아래
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : null}
    </main>
  );
}

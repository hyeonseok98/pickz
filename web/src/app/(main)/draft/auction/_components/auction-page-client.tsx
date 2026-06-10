"use client";

import { Button, SectionCard } from "@/components/common/ui";
import {
  auctionAnnounceCountdownSeconds,
  auctionBiddingSeconds,
  auctionInitialStandbySeconds,
  auctionMaxReauctionCount,
  getAuctionTeamColorClassNames,
} from "@/constants/draft";
import type {
  AuctionChatMessage,
  AuctionChatMessageSegment,
  AuctionPageState,
  AuctionPhase,
  AuctionStreamer,
  AuctionTeamState,
} from "@/types/draft";
import {
  applyAuctionAutoAssignedResult,
  applyAuctionSoldResult,
  createAuctionLogTime,
  createAuctionTeamName,
  createAuctionTurnAnnouncement,
  getRandomAuctionAssignableTeam,
  resetAuctionTeamStates,
  shuffleAuctionStreamers,
  validateAuctionBidAmount,
} from "@/utils/draft/auction";
import { cn } from "@/utils";
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

interface AuctionGameSettings {
  biddingSeconds: number;
  isUntimedAuction: boolean;
  standbySeconds: number;
}

interface CurrentHighestBid {
  amount: number;
  teamId: number;
  teamName: string;
}

interface AuctionLogPayload {
  message: string;
  segments?: AuctionChatMessageSegment[];
  type?: AuctionChatMessage["type"];
}

const auctionPhaseBeforeFinish = new Set<AuctionPhase>([
  "STANDBY",
  "COUNTDOWN",
  "BIDDING",
  "ROUND_RESULT",
]);

const auctionLineLogLabelMap: Record<AuctionStreamer["line"], string> = {
  adc: "원딜",
  jungle: "정글",
  mid: "미드",
  support: "서폿",
  top: "탑",
};

function normalizeAuctionTeamStates(teamStates: AuctionTeamState[]) {
  return teamStates.map((teamState) => ({
    ...teamState,
    teamName: createAuctionTeamName(teamState.staff),
  }));
}

function createAuctionLogEntry({
  message,
  segments,
  type = "system",
}: AuctionLogPayload): AuctionChatMessage {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    message,
    segments,
    sentAt: createAuctionLogTime(),
    type,
  };
}

function getLineTone(line: AuctionStreamer["line"]): AuctionChatMessageSegment["tone"] {
  switch (line) {
    case "top":
      return "lineTop";
    case "jungle":
      return "lineJungle";
    case "mid":
      return "lineMid";
    case "adc":
      return "lineAdc";
    case "support":
      return "lineSupport";
  }
}

function getTeamTone(teamId: number): AuctionChatMessageSegment["tone"] {
  switch (teamId) {
    case 1:
      return "teamOne";
    case 2:
      return "teamTwo";
    case 3:
      return "teamThree";
    case 4:
      return "teamFour";
    default:
      return "teamFive";
  }
}

function createTurnAnnouncementLog(streamer: AuctionStreamer) {
  return createAuctionLogEntry({
    message: createAuctionTurnAnnouncement(streamer),
    segments: [
      { text: auctionLineLogLabelMap[streamer.line], tone: getLineTone(streamer.line) },
      { text: "-" },
      { text: streamer.name, tone: "primary" },
      { text: " 경매 차례입니다." },
    ],
  });
}

function createCountdownLog(seconds: number) {
  return createAuctionLogEntry({
    message: `${seconds}, ${seconds - 1}, ${seconds - 2}`,
    segments: [{ text: `${seconds}`, tone: "warning" }, { text: "초 카운트다운" }],
  });
}

function createBidStartLog() {
  return createAuctionLogEntry({
    message: "입찰 시작",
    segments: [{ text: "입찰", tone: "primary" }, { text: "이 시작되었습니다." }],
  });
}

function createBidPlacedLog(teamId: number, teamName: string, streamerName: string, bidAmount: number) {
  return createAuctionLogEntry({
    message: `${teamName}-${streamerName}-${bidAmount}포인트`,
    segments: [
      { text: teamName, tone: getTeamTone(teamId) },
      { text: "-" },
      { text: streamerName },
      { text: "-" },
      { text: `${bidAmount}포인트`, tone: "warning" },
    ],
    type: "bid",
  });
}

function createSoldLog(teamId: number, teamName: string, streamerName: string, bidAmount: number) {
  return createAuctionLogEntry({
    message: `${teamName}-${streamerName}-${bidAmount}포인트-낙찰`,
    segments: [
      { text: teamName, tone: getTeamTone(teamId) },
      { text: "-" },
      { text: streamerName },
      { text: "-" },
      { text: `${bidAmount}포인트`, tone: "warning" },
      { text: "-" },
      { text: "낙찰", tone: "success" },
    ],
    type: "bid",
  });
}

function createAutoAssignedLog(teamId: number, teamName: string, streamerName: string) {
  return createAuctionLogEntry({
    message: `${teamName} ${streamerName} 자동 배정`,
    segments: [
      { text: "재경매", tone: "warning" },
      { text: " 한도 종료로 " },
      { text: streamerName, tone: "primary" },
      { text: " 선수가 " },
      { text: teamName, tone: getTeamTone(teamId) },
      { text: " 팀에 " },
      { text: "자동 배정", tone: "success" },
      { text: "되었습니다." },
    ],
  });
}

function createAutoAssignFailedLog(streamerName: string) {
  return createAuctionLogEntry({
    message: `${streamerName} 자동 배정 실패`,
    segments: [
      { text: streamerName, tone: "primary" },
      { text: " 선수를 배정할 빈 라인 슬롯이 없습니다.", tone: "danger" },
    ],
  });
}

function createUnbidLog(streamer: AuctionStreamer) {
  return createAuctionLogEntry({
    message: `${streamer.name} 유찰`,
    segments: [
      { text: streamer.name, tone: "primary" },
      { text: " 선수가 " },
      { text: "유찰", tone: "danger" },
      { text: "되었습니다." },
    ],
  });
}

function createReauctionLog(round: number, streamer: AuctionStreamer) {
  return createAuctionLogEntry({
    message: `${round}차 재경매 ${streamer.name}`,
    segments: [
      { text: `재경매 ${round}회차`, tone: "warning" },
      { text: ": " },
      { text: createTurnAnnouncementLog(streamer).message, tone: "muted" },
    ],
  });
}

function createRoundWaitLog(waitSeconds: number) {
  return createAuctionLogEntry({
    message: `${waitSeconds}초 대기`,
    segments: [
      { text: "다음 경매까지 ", tone: "muted" },
      { text: `${waitSeconds}초`, tone: "warning" },
      { text: " 대기합니다.", tone: "muted" },
    ],
  });
}

function createUntimedStartLog() {
  return createAuctionLogEntry({
    message: "시간 제한 없는 경매 시작",
    segments: [
      { text: "시간 제한 없는 경매", tone: "primary" },
      { text: "를 시작합니다." },
    ],
  });
}

function createTimedStartLog(waitSeconds: number) {
  return createAuctionLogEntry({
    message: `${waitSeconds}초 뒤 시작`,
    segments: [
      { text: "게임 시작 전 ", tone: "muted" },
      { text: `${waitSeconds}초`, tone: "warning" },
      { text: " 대기합니다.", tone: "muted" },
    ],
  });
}

function createResetLog() {
  return createAuctionLogEntry({
    message: "경매 대기중 상태로 돌아갔습니다",
    segments: [{ text: "경매 대기중 상태", tone: "primary" }, { text: "로 돌아갔습니다." }],
  });
}

export function AuctionPageClient({ initialAuctionPageState }: AuctionPageClientProps) {
  const initialTeamStates = normalizeAuctionTeamStates(initialAuctionPageState.teamStates);
  const [auctionOrder, setAuctionOrder] = useState(initialAuctionPageState.upcomingStreamers);
  const [remainingAuctionQueue, setRemainingAuctionQueue] = useState(
    initialAuctionPageState.upcomingStreamers,
  );
  const [currentStreamer, setCurrentStreamer] = useState<AuctionStreamer | null>(null);
  const [currentPhase, setCurrentPhase] = useState<AuctionPhase>("STANDBY");
  const [remainSeconds, setRemainSeconds] = useState(auctionInitialStandbySeconds);
  const [currentHighestBid, setCurrentHighestBid] = useState<CurrentHighestBid | null>(null);
  const [unbidStreamers, setUnbidStreamers] = useState(initialAuctionPageState.unbidStreamers);
  const [teamStates, setTeamStates] = useState(initialTeamStates);
  const [auctionLogs, setAuctionLogs] = useState(initialAuctionPageState.logs);
  const [isGameSettingsPanelOpen, setIsGameSettingsPanelOpen] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [reauctionCount, setReauctionCount] = useState(0);
  const [selectedBidTeamId, setSelectedBidTeamId] = useState<number | null>(
    initialTeamStates[0]?.teamId ?? null,
  );
  const [auctionSettings, setAuctionSettings] = useState<AuctionGameSettings>({
    biddingSeconds: auctionBiddingSeconds,
    isUntimedAuction: false,
    standbySeconds: auctionInitialStandbySeconds,
  });
  const [settingsStandbySeconds, setSettingsStandbySeconds] = useState(
    String(auctionInitialStandbySeconds),
  );
  const [settingsBiddingSeconds, setSettingsBiddingSeconds] = useState(String(auctionBiddingSeconds));
  const [isUntimedAuctionChecked, setIsUntimedAuctionChecked] = useState(false);

  const selectedBidTeam =
    teamStates.find((teamState) => teamState.teamId === selectedBidTeamId) ?? null;
  const selectedBidTeamColorClassNames = selectedBidTeam
    ? getAuctionTeamColorClassNames(selectedBidTeam.staff.teamSlot)
    : null;
  const isConsecutiveBidBlocked = Boolean(
    currentHighestBid && selectedBidTeam && currentHighestBid.teamId === selectedBidTeam.teamId,
  );
  const isSelectedTeamLineAlreadyFilled = Boolean(
    currentStreamer && selectedBidTeam?.roster[currentStreamer.line],
  );
  const queueStreamers = isGameStarted ? remainingAuctionQueue : auctionOrder;

  const appendAuctionLog = useCallback((payload: AuctionLogPayload) => {
    setAuctionLogs((currentLogs) => [...currentLogs, createAuctionLogEntry(payload)]);
  }, []);

  const openNextAuctionRound = useCallback((
    nextQueue: AuctionStreamer[],
    nextUnbidStreamers: AuctionStreamer[],
    nextReauctionCount: number,
  ) => {
    const nextStreamer = nextQueue[0];

    if (nextStreamer) {
      setCurrentStreamer(nextStreamer);
      setRemainingAuctionQueue(nextQueue.slice(1));
      setCurrentHighestBid(null);
      appendAuctionLog(createTurnAnnouncementLog(nextStreamer));

      if (auctionSettings.isUntimedAuction) {
        setCurrentPhase("BIDDING");
        setRemainSeconds(0);
      } else {
        setCurrentPhase("COUNTDOWN");
        setRemainSeconds(auctionAnnounceCountdownSeconds);
        appendAuctionLog(createCountdownLog(auctionAnnounceCountdownSeconds));
      }

      return;
    }

    if (nextUnbidStreamers.length > 0 && nextReauctionCount < auctionMaxReauctionCount) {
      const [reauctionStreamer, ...restUnbidStreamers] = nextUnbidStreamers;

      if (!reauctionStreamer) {
        return;
      }

      setCurrentStreamer(reauctionStreamer);
      setRemainingAuctionQueue(restUnbidStreamers);
      setUnbidStreamers([]);
      setCurrentHighestBid(null);
      setReauctionCount(nextReauctionCount + 1);
      appendAuctionLog(createReauctionLog(nextReauctionCount + 1, reauctionStreamer));

      if (auctionSettings.isUntimedAuction) {
        setCurrentPhase("BIDDING");
        setRemainSeconds(0);
      } else {
        setCurrentPhase("COUNTDOWN");
        setRemainSeconds(auctionAnnounceCountdownSeconds);
        appendAuctionLog(createCountdownLog(auctionAnnounceCountdownSeconds));
      }

      return;
    }

    if (nextUnbidStreamers.length > 0 && nextReauctionCount >= auctionMaxReauctionCount) {
      let nextTeamStates = teamStates;
      const autoAssignmentLogs: AuctionChatMessage[] = [];

      nextUnbidStreamers.forEach((streamer) => {
        const assignableTeam = getRandomAuctionAssignableTeam(nextTeamStates, streamer);

        if (!assignableTeam) {
          autoAssignmentLogs.push(createAutoAssignFailedLog(streamer.name));
          return;
        }

        nextTeamStates = applyAuctionAutoAssignedResult({
          streamer,
          teamId: assignableTeam.teamId,
          teamStates: nextTeamStates,
        });
        autoAssignmentLogs.push(
          createAutoAssignedLog(assignableTeam.teamId, assignableTeam.teamName, streamer.name),
        );
      });

      setTeamStates(nextTeamStates);
      setUnbidStreamers([]);
      setRemainingAuctionQueue([]);
      setAuctionLogs((currentLogs) => [...currentLogs, ...autoAssignmentLogs]);
    }

    setCurrentStreamer(null);
    setCurrentHighestBid(null);
    setCurrentPhase("FINISHED");
    setRemainSeconds(0);
    setIsGameStarted(false);
    appendAuctionLog({
      message: "경매가 종료되었습니다",
      segments: [{ text: "경매", tone: "primary" }, { text: "가 종료되었습니다." }],
    });
  }, [appendAuctionLog, auctionSettings.isUntimedAuction, teamStates]);

  const finalizeAuctionRound = useCallback((shouldMarkUnbid: boolean) => {
    if (!currentStreamer) {
      return;
    }

    if (shouldMarkUnbid || !currentHighestBid) {
      const nextUnbidStreamers = [...unbidStreamers, currentStreamer];

      setUnbidStreamers(nextUnbidStreamers);
      appendAuctionLog(createUnbidLog(currentStreamer));

      if (auctionSettings.isUntimedAuction) {
        openNextAuctionRound(remainingAuctionQueue, nextUnbidStreamers, reauctionCount);
        return;
      }

      setCurrentPhase("ROUND_RESULT");
      setRemainSeconds(auctionSettings.standbySeconds);
      appendAuctionLog(createRoundWaitLog(auctionSettings.standbySeconds));
      return;
    }

    setTeamStates((currentTeamStates) =>
      applyAuctionSoldResult({
        bidAmount: currentHighestBid.amount,
        streamer: currentStreamer,
        teamId: currentHighestBid.teamId,
        teamStates: currentTeamStates,
      }),
    );
    appendAuctionLog(
      createSoldLog(
        currentHighestBid.teamId,
        currentHighestBid.teamName,
        currentStreamer.name,
        currentHighestBid.amount,
      ),
    );

    if (auctionSettings.isUntimedAuction) {
      openNextAuctionRound(remainingAuctionQueue, unbidStreamers, reauctionCount);
      return;
    }

    setCurrentPhase("ROUND_RESULT");
    setRemainSeconds(auctionSettings.standbySeconds);
    appendAuctionLog(createRoundWaitLog(auctionSettings.standbySeconds));
  }, [
    appendAuctionLog,
    auctionSettings.isUntimedAuction,
    auctionSettings.standbySeconds,
    currentHighestBid,
    currentStreamer,
    openNextAuctionRound,
    reauctionCount,
    remainingAuctionQueue,
    unbidStreamers,
  ]);

  useEffect(() => {
    if (!isGameStarted || auctionSettings.isUntimedAuction || currentPhase === "FINISHED") {
      return;
    }

    if (!auctionPhaseBeforeFinish.has(currentPhase)) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (currentPhase === "STANDBY") {
        if (remainSeconds <= 1) {
          openNextAuctionRound(auctionOrder, unbidStreamers, reauctionCount);
          return;
        }

        setRemainSeconds((currentSeconds) => currentSeconds - 1);
        return;
      }

      if (currentPhase === "COUNTDOWN") {
        if (remainSeconds <= 1) {
          setCurrentPhase("BIDDING");
          setRemainSeconds(auctionSettings.biddingSeconds);
          appendAuctionLog(createBidStartLog());
          return;
        }

        const nextSeconds = remainSeconds - 1;

        setRemainSeconds(nextSeconds);
        appendAuctionLog(createCountdownLog(nextSeconds));
        return;
      }

      if (currentPhase === "BIDDING") {
        if (remainSeconds <= 1) {
          finalizeAuctionRound(false);
          return;
        }

        setRemainSeconds((currentSeconds) => currentSeconds - 1);
        return;
      }

      if (currentPhase === "ROUND_RESULT") {
        if (remainSeconds <= 1) {
          openNextAuctionRound(remainingAuctionQueue, unbidStreamers, reauctionCount);
          return;
        }

        setRemainSeconds((currentSeconds) => currentSeconds - 1);
      }
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    appendAuctionLog,
    auctionOrder,
    auctionSettings.biddingSeconds,
    auctionSettings.isUntimedAuction,
    currentPhase,
    finalizeAuctionRound,
    isGameStarted,
    openNextAuctionRound,
    reauctionCount,
    remainSeconds,
    remainingAuctionQueue,
    unbidStreamers,
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

  const startAuctionGame = () => {
    setCurrentStreamer(null);
    setCurrentHighestBid(null);
    setUnbidStreamers([]);
    setTeamStates(resetAuctionTeamStates(teamStates).map((teamState) => ({
      ...teamState,
      teamName: createAuctionTeamName(teamState.staff),
    })));
    setRemainingAuctionQueue(auctionOrder);
    setReauctionCount(0);
    setIsGameStarted(true);
    setIsGameSettingsPanelOpen(false);
    setAuctionLogs([]);

    if (auctionSettings.isUntimedAuction) {
      appendAuctionLog(createUntimedStartLog());
      openNextAuctionRound(auctionOrder, [], 0);
      return;
    }

    setCurrentPhase("STANDBY");
    setRemainSeconds(auctionSettings.standbySeconds);
    appendAuctionLog(createTimedStartLog(auctionSettings.standbySeconds));
  };

  const resetAuctionGame = () => {
    setCurrentStreamer(null);
    setCurrentHighestBid(null);
    setUnbidStreamers([]);
    setRemainingAuctionQueue(auctionOrder);
    setTeamStates(resetAuctionTeamStates(teamStates).map((teamState) => ({
      ...teamState,
      teamName: createAuctionTeamName(teamState.staff),
    })));
    setCurrentPhase("STANDBY");
    setRemainSeconds(auctionSettings.standbySeconds);
    setReauctionCount(0);
    setIsGameStarted(false);
    setIsGameSettingsPanelOpen(false);
    setAuctionLogs([createResetLog()]);
  };

  const submitBid = (bidAmount: number) => {
    if (currentPhase !== "BIDDING" || !currentStreamer || !selectedBidTeam) {
      return;
    }

    if (currentHighestBid?.teamId === selectedBidTeam.teamId) {
      return;
    }

    if (selectedBidTeam.roster[currentStreamer.line]) {
      return;
    }

    const validation = validateAuctionBidAmount({
      amount: bidAmount,
      currentHighestBidAmount: currentHighestBid?.amount ?? 0,
      remainingPoints: selectedBidTeam.remainingPoints,
    });

    if (!validation.isValid) {
      return;
    }

    setCurrentHighestBid({
      amount: bidAmount,
      teamId: selectedBidTeam.teamId,
      teamName: selectedBidTeam.teamName,
    });

    if (!auctionSettings.isUntimedAuction) {
      setRemainSeconds(auctionSettings.biddingSeconds);
    }

    appendAuctionLog(
      createBidPlacedLog(
        selectedBidTeam.teamId,
        selectedBidTeam.teamName,
        currentStreamer.name,
        bidAmount,
      ),
    );
  };

  const confirmGameSettings = () => {
    const nextStandbySeconds = Math.max(1, Number(settingsStandbySeconds) || auctionInitialStandbySeconds);
    const nextBiddingSeconds = Math.max(1, Number(settingsBiddingSeconds) || auctionBiddingSeconds);

    setAuctionSettings({
      biddingSeconds: nextBiddingSeconds,
      isUntimedAuction: isUntimedAuctionChecked,
      standbySeconds: nextStandbySeconds,
    });
    setIsGameSettingsPanelOpen(false);
  };

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-[#f7f5ff] px-2 py-2 sm:px-3 xl:h-[calc(100dvh-var(--header-height))] xl:overflow-hidden">
      <div className="mx-auto flex w-full max-w-430 justify-center xl:h-full">
        <div className="grid w-full max-w-415 gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,26rem)_minmax(0,28.5rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,31rem)_minmax(0,30rem)_minmax(0,1fr)]">
          <AuctionTeamRosterSection
            initialPoints={initialAuctionPageState.initialTeamPoints}
            onSelectTeam={initialAuctionPageState.isSoloMode ? setSelectedBidTeamId : undefined}
            selectedTeamId={selectedBidTeamId}
            teamStates={teamStates}
          />

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,11.5rem)] 2xl:grid-rows-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,11.5rem)]">
            <AuctionMainStageSection
              currentHighestBidAmount={currentHighestBid?.amount ?? 0}
              currentHighestBidTeamName={currentHighestBid?.teamName ?? null}
              currentPhase={currentPhase}
              currentStreamer={currentStreamer}
            />

            <AuctionBidLogSection logs={auctionLogs} />
            <AuctionBidControlPanel
              currentHighestBidAmount={currentHighestBid?.amount ?? 0}
              isBidDisabled={currentPhase !== "BIDDING" || !currentStreamer || !selectedBidTeam}
              isConfirmSoldDisabled={
                currentPhase !== "BIDDING" || !currentStreamer || !currentHighestBid
              }
              isConsecutiveBidBlocked={isConsecutiveBidBlocked}
              isLineAlreadyFilled={isSelectedTeamLineAlreadyFilled}
              isMarkUnbidDisabled={Boolean(currentHighestBid)}
              isUntimedAuction={auctionSettings.isUntimedAuction}
              onConfirmSold={
                initialAuctionPageState.isSoloMode && auctionSettings.isUntimedAuction
                  ? () => {
                      finalizeAuctionRound(false);
                    }
                  : undefined
              }
              onMarkUnbid={
                initialAuctionPageState.isSoloMode && auctionSettings.isUntimedAuction
                  ? () => {
                      finalizeAuctionRound(true);
                    }
                  : undefined
              }
              onSubmitBid={submitBid}
              remainingPoints={selectedBidTeam?.remainingPoints ?? 0}
              remainSeconds={remainSeconds}
              selectedTeamColorClassNames={selectedBidTeamColorClassNames}
              selectedTeamName={selectedBidTeam?.teamName ?? null}
            />
          </div>

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(0,1fr)_auto]">
            <AuctionStreamerQueueSection
              isGameStarted={isGameStarted}
              isGameSettingsDisabled={!initialAuctionPageState.isSoloMode}
              onOpenGameSettings={() => {
                if (!initialAuctionPageState.isSoloMode) {
                  return;
                }

                setSettingsStandbySeconds(String(auctionSettings.standbySeconds));
                setSettingsBiddingSeconds(String(auctionSettings.biddingSeconds));
                setIsUntimedAuctionChecked(auctionSettings.isUntimedAuction);
                setIsGameSettingsPanelOpen(true);
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

      {isGameSettingsPanelOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-6">
          <SectionCard
            padding="md"
            className="w-full max-w-xl border-violet-100 bg-white"
            title="게임 설정"
            headerEnd={
              <Button type="button" size="sm" onClick={confirmGameSettings}>
                확인
              </Button>
            }
          >
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-violet-50 p-1">
                <button
                  type="button"
                  className={cn(
                    "h-10 cursor-pointer rounded-xl text-sm font-bold transition-colors",
                    !isUntimedAuctionChecked
                      ? "bg-white text-violet-700 shadow-surface-sm"
                      : "text-text-secondary",
                  )}
                  onClick={() => {
                    setIsUntimedAuctionChecked(false);
                  }}
                >
                  시간제한 있음
                </button>
                <button
                  type="button"
                  className={cn(
                    "h-10 cursor-pointer rounded-xl text-sm font-bold transition-colors",
                    isUntimedAuctionChecked
                      ? "bg-white text-violet-700 shadow-surface-sm"
                      : "text-text-secondary",
                  )}
                  onClick={() => {
                    setIsUntimedAuctionChecked(true);
                  }}
                >
                  시간제한 없음
                </button>
              </div>

              {!isUntimedAuctionChecked ? (
                <div className="grid gap-4">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-text-primary">게임 시작 전 대기시간</span>
                    <span className="text-xs font-semibold text-text-secondary">
                      게임 시작 버튼을 누른 뒤 첫 경매가 열리기 전까지 기다리는 시간입니다.
                    </span>
                    <div className="grid h-11 grid-cols-[minmax(0,1fr)_2.5rem] items-center rounded-2xl border border-violet-100 px-4">
                      <input
                        inputMode="numeric"
                        value={settingsStandbySeconds}
                        onChange={(event) => {
                          setSettingsStandbySeconds(event.target.value.replace(/\D/g, ""));
                        }}
                        className="min-w-0 bg-transparent text-sm font-semibold text-text-primary outline-none"
                      />
                      <span className="text-right text-sm font-bold text-text-secondary">초</span>
                    </div>
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-text-primary">경매 시간</span>
                    <span className="text-xs font-semibold text-text-secondary">
                      각 선수 경매가 시작된 뒤 입찰을 받을 수 있는 제한 시간입니다.
                    </span>
                    <div className="grid h-11 grid-cols-[minmax(0,1fr)_2.5rem] items-center rounded-2xl border border-violet-100 px-4">
                      <input
                        inputMode="numeric"
                        value={settingsBiddingSeconds}
                        onChange={(event) => {
                          setSettingsBiddingSeconds(event.target.value.replace(/\D/g, ""));
                        }}
                        className="min-w-0 bg-transparent text-sm font-semibold text-text-primary outline-none"
                      />
                      <span className="text-right text-sm font-bold text-text-secondary">초</span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-4 text-sm font-semibold text-text-secondary">
                  시간 제한 없이 직접 입찰, 낙찰, 유찰을 진행합니다.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      ) : null}
    </main>
  );
}

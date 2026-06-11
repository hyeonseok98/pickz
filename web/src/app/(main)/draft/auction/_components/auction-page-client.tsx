"use client";

import {
  auctionAnnounceCountdownSeconds,
  auctionBiddingSeconds,
  auctionInitialStandbySeconds,
  auctionMaxReauctionCount,
  getAuctionTeamColorClassNames,
} from "@/constants/draft";
import type {
  AuctionChatMessage,
  AuctionPageState,
  AuctionPhase,
  AuctionStreamer,
  AuctionTeamState,
} from "@/types/draft";
import {
  applyAuctionAutoAssignedResult,
  applyAuctionSoldResult,
  createAutoAssignFailedLog,
  createAutoAssignedLog,
  createAuctionFinishedLog,
  createBidPlacedLog,
  createBidStartLog,
  createCountdownLog,
  createReauctionAutoAssignNoticeLog,
  createReauctionLog,
  createResetLog,
  createRoundWaitLog,
  createSoldLog,
  createTimedStartLog,
  createTurnAnnouncementLog,
  createUnbidLog,
  createUntimedStartLog,
  createAuctionTeamName,
  getRandomAuctionAssignableTeam,
  resetAuctionTeamStates,
  resolveAuctionForcedAssignments,
  shuffleAuctionStreamers,
  validateAuctionBidAmount,
} from "@/utils/draft/auction";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuctionBidControlPanel } from "./auction-bid-control-panel";
import { AuctionGameSettingsDialog } from "./auction-game-settings-dialog";
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

type AuctionRoundSource = "queue" | "unbid" | null;

const auctionPhaseBeforeFinish = new Set<AuctionPhase>([
  "STANDBY",
  "COUNTDOWN",
  "BIDDING",
  "ROUND_RESULT",
]);

function normalizeAuctionTeamStates(teamStates: AuctionTeamState[]) {
  return teamStates.map((teamState) => ({
    ...teamState,
    teamName: createAuctionTeamName(teamState.staff),
  }));
}

function getUniqueAuctionStreamers(streamers: AuctionStreamer[]) {
  const seenStreamerIds = new Set<string>();

  return streamers.filter((streamer) => {
    if (seenStreamerIds.has(streamer.id)) {
      return false;
    }

    seenStreamerIds.add(streamer.id);
    return true;
  });
}

export function AuctionPageClient({ initialAuctionPageState }: AuctionPageClientProps) {
  const router = useRouter();
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
  const [reauctionRoundTurnCount, setReauctionRoundTurnCount] = useState(0);
  const [currentRoundSource, setCurrentRoundSource] = useState<AuctionRoundSource>(null);
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
  const isGameFinished = currentPhase === "FINISHED";
  const queueStreamers = isGameFinished ? [] : isGameStarted ? remainingAuctionQueue : auctionOrder;
  const visibleReauctionRound = currentRoundSource === "unbid" ? reauctionCount : 0;
  const processedReauctionCount =
    currentRoundSource === "unbid" ? Math.min(reauctionRoundTurnCount, unbidStreamers.length) : 0;
  const currentReauctionBoundaryIndex = Math.max(0, unbidStreamers.length - processedReauctionCount);
  const currentReauctionStreamers = unbidStreamers.slice(0, currentReauctionBoundaryIndex);
  const nextReauctionStreamers = unbidStreamers.slice(currentReauctionBoundaryIndex);
  const currentReauctionLabel =
    reauctionCount > 0
      ? `${reauctionCount}차 재경매 ${currentRoundSource === "unbid" ? "진행 중" : "대기"}`
      : "1차 재경매 대기";
  const nextReauctionLabel =
    reauctionCount >= auctionMaxReauctionCount ? "랜덤 배정 대기" : `${reauctionCount + 1}차 재경매 대기`;

  const appendAuctionLog = useCallback((log: AuctionChatMessage) => {
    setAuctionLogs((currentLogs) => [...currentLogs, log]);
  }, []);

  const applyForcedAssignments = useCallback(({
    queue,
    teamStates: currentTeamStates,
    unbidStreamers: currentUnbidStreamers,
  }: {
    queue: AuctionStreamer[];
    teamStates: AuctionTeamState[];
    unbidStreamers: AuctionStreamer[];
  }) => {
    const result = resolveAuctionForcedAssignments({
      queue,
      teamStates: currentTeamStates,
      unbidStreamers: currentUnbidStreamers,
    });

    return {
      ...result,
      logs: result.assignments.map(({ streamer, team }) =>
        createAutoAssignedLog(team.teamId, team.teamName, streamer.name),
      ),
    };
  }, []);

  const openNextAuctionRound = useCallback((
    nextQueue: AuctionStreamer[],
    nextUnbidStreamers: AuctionStreamer[],
    nextReauctionCount: number,
    nextTeamStates = teamStates,
  ) => {
    const nextStreamer = nextQueue[0];

    if (nextStreamer) {
      setCurrentStreamer(nextStreamer);
      setRemainingAuctionQueue(nextQueue.slice(1));
      setCurrentHighestBid(null);
      setCurrentRoundSource("queue");
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

    if (nextUnbidStreamers.length > 0 && nextReauctionCount <= auctionMaxReauctionCount) {
      const [reauctionStreamer] = nextUnbidStreamers;

      if (!reauctionStreamer) {
        return;
      }

      const nextRoundCount = nextReauctionCount === 0 ? 1 : nextReauctionCount;

      setCurrentStreamer(reauctionStreamer);
      setRemainingAuctionQueue([]);
      setUnbidStreamers(nextUnbidStreamers.slice(1));
      setCurrentHighestBid(null);
      setCurrentRoundSource("unbid");
      setReauctionCount(nextRoundCount);
      appendAuctionLog(createReauctionLog(nextRoundCount, reauctionStreamer));

      if (nextRoundCount === auctionMaxReauctionCount) {
        appendAuctionLog(createReauctionAutoAssignNoticeLog());
      }

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

    if (nextUnbidStreamers.length > 0 && nextReauctionCount > auctionMaxReauctionCount) {
      let autoAssignedTeamStates = nextTeamStates;
      const autoAssignmentLogs: AuctionChatMessage[] = [];

      nextUnbidStreamers.forEach((streamer) => {
        const assignableTeam = getRandomAuctionAssignableTeam(autoAssignedTeamStates, streamer);

        if (!assignableTeam) {
          autoAssignmentLogs.push(createAutoAssignFailedLog(streamer.name));
          return;
        }

        autoAssignedTeamStates = applyAuctionAutoAssignedResult({
          streamer,
          teamId: assignableTeam.teamId,
          teamStates: autoAssignedTeamStates,
        });
        autoAssignmentLogs.push(
          createAutoAssignedLog(assignableTeam.teamId, assignableTeam.teamName, streamer.name),
        );
      });

      setTeamStates(autoAssignedTeamStates);
      setUnbidStreamers([]);
      setRemainingAuctionQueue([]);
      setAuctionLogs((currentLogs) => [...currentLogs, ...autoAssignmentLogs]);
    }

    setCurrentStreamer(null);
    setCurrentHighestBid(null);
    setCurrentRoundSource(null);
    setCurrentPhase("FINISHED");
    setRemainSeconds(0);
    setIsGameStarted(false);
    appendAuctionLog(createAuctionFinishedLog());
  }, [appendAuctionLog, auctionSettings.isUntimedAuction, teamStates]);

  const finalizeAuctionRound = useCallback((shouldMarkUnbid: boolean) => {
    if (!currentStreamer) {
      return;
    }

    if (shouldMarkUnbid || !currentHighestBid) {
      const unbidLog = createUnbidLog(currentStreamer);
      const nextUnbidStreamers =
        currentRoundSource === "unbid"
          ? [
            ...unbidStreamers,
            currentStreamer,
          ]
          : getUniqueAuctionStreamers([
            ...unbidStreamers,
            currentStreamer,
          ]);
      const currentReauctionTurnCount =
        currentRoundSource === "unbid" ? reauctionRoundTurnCount + 1 : reauctionRoundTurnCount;
      const currentReauctionRoundSize =
        currentRoundSource === "unbid" ? unbidStreamers.length + 1 : unbidStreamers.length;
      const isCurrentReauctionRoundFinished =
        currentRoundSource === "unbid" && currentReauctionTurnCount >= currentReauctionRoundSize;
      const nextReauctionCount = isCurrentReauctionRoundFinished
        ? reauctionCount + 1
        : reauctionCount;
      const nextReauctionTurnCount = isCurrentReauctionRoundFinished
        ? 0
        : currentReauctionTurnCount;
      const forcedAssignmentResult = applyForcedAssignments({
        queue: remainingAuctionQueue,
        teamStates,
        unbidStreamers: nextUnbidStreamers,
      });

      setReauctionRoundTurnCount(nextReauctionTurnCount);
      setReauctionCount(nextReauctionCount);
      setTeamStates(forcedAssignmentResult.teamStates);
      setRemainingAuctionQueue(forcedAssignmentResult.queue);
      setUnbidStreamers(forcedAssignmentResult.unbidStreamers);
      setAuctionLogs((currentLogs) => [
        ...currentLogs,
        unbidLog,
        ...forcedAssignmentResult.logs,
      ]);

      if (auctionSettings.isUntimedAuction) {
        openNextAuctionRound(
          forcedAssignmentResult.queue,
          forcedAssignmentResult.unbidStreamers,
          nextReauctionCount,
          forcedAssignmentResult.teamStates,
        );
        return;
      }

      setCurrentPhase("ROUND_RESULT");
      setRemainSeconds(auctionSettings.standbySeconds);
      appendAuctionLog(createRoundWaitLog(auctionSettings.standbySeconds));
      return;
    }

    const soldTeamStates = applyAuctionSoldResult({
      bidAmount: currentHighestBid.amount,
      streamer: currentStreamer,
      teamId: currentHighestBid.teamId,
      teamStates,
    });
    const soldLog = createSoldLog(
      currentHighestBid.teamId,
      currentHighestBid.teamName,
      currentStreamer.name,
      currentHighestBid.amount,
    );
    const nextUnbidStreamers =
      currentRoundSource === "unbid"
        ? unbidStreamers.filter((streamer) => streamer.id !== currentStreamer.id)
        : unbidStreamers;
    const forcedAssignmentResult = applyForcedAssignments({
      queue: remainingAuctionQueue,
      teamStates: soldTeamStates,
      unbidStreamers: nextUnbidStreamers,
    });

    setTeamStates(forcedAssignmentResult.teamStates);
    setRemainingAuctionQueue(forcedAssignmentResult.queue);
    setUnbidStreamers(forcedAssignmentResult.unbidStreamers);
    setAuctionLogs((currentLogs) => [
      ...currentLogs,
      soldLog,
      ...forcedAssignmentResult.logs,
    ]);

    if (auctionSettings.isUntimedAuction) {
      openNextAuctionRound(
        forcedAssignmentResult.queue,
        forcedAssignmentResult.unbidStreamers,
        reauctionCount,
        forcedAssignmentResult.teamStates,
      );
      return;
    }

    setCurrentPhase("ROUND_RESULT");
    setRemainSeconds(auctionSettings.standbySeconds);
    appendAuctionLog(createRoundWaitLog(auctionSettings.standbySeconds));
  }, [
    applyForcedAssignments,
    appendAuctionLog,
    auctionSettings.isUntimedAuction,
    auctionSettings.standbySeconds,
    currentHighestBid,
    currentRoundSource,
    currentStreamer,
    openNextAuctionRound,
    reauctionCount,
    reauctionRoundTurnCount,
    remainingAuctionQueue,
    teamStates,
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
    setReauctionRoundTurnCount(0);
    setCurrentRoundSource(null);
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
    setReauctionRoundTurnCount(0);
    setCurrentRoundSource(null);
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

  const exitAuctionRoom = () => {
    if (initialAuctionPageState.isSoloMode) {
      router.back();
      return;
    }

    router.push("/draft");
  };

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-[#f7f5ff] px-2 py-2 sm:px-3 lg:h-[calc(100dvh-var(--header-height))] lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-430 justify-center lg:h-full">
        <div className="grid w-full max-w-415 gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,26rem)_minmax(0,28.5rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,31rem)_minmax(0,30rem)_minmax(0,1fr)]">
          <AuctionTeamRosterSection
            initialPoints={initialAuctionPageState.initialTeamPoints}
            onSelectTeam={initialAuctionPageState.isSoloMode ? setSelectedBidTeamId : undefined}
            selectedTeamId={selectedBidTeamId}
            teamStates={teamStates}
          />

          <div className="grid gap-3 lg:min-h-0 lg:grid-rows-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,11.5rem)] 2xl:grid-rows-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,11.5rem)]">
            <AuctionMainStageSection
              currentHighestBidAmount={currentHighestBid?.amount ?? 0}
              currentHighestBidTeamName={currentHighestBid?.teamName ?? null}
              currentPhase={currentPhase}
              currentStreamer={currentStreamer}
              reauctionRound={visibleReauctionRound}
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

          <div className="grid gap-3 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto]">
            <AuctionStreamerQueueSection
              isGameFinished={isGameFinished}
              isGameStarted={isGameStarted}
              isGameSettingsDisabled={!initialAuctionPageState.isSoloMode}
              onExitRoom={exitAuctionRoom}
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
            <AuctionUnsoldStreamerSection
              currentRoundLabel={currentReauctionLabel}
              isAutoAssignmentReady={reauctionCount >= auctionMaxReauctionCount}
              nextRoundLabel={nextReauctionLabel}
              nextRoundStreamers={nextReauctionStreamers}
              streamers={currentReauctionStreamers}
            />
          </div>
        </div>
      </div>

      {isGameSettingsPanelOpen ? (
        <AuctionGameSettingsDialog
          biddingSeconds={settingsBiddingSeconds}
          isUntimedAuction={isUntimedAuctionChecked}
          onBiddingSecondsChange={setSettingsBiddingSeconds}
          onClose={confirmGameSettings}
          onStandbySecondsChange={setSettingsStandbySeconds}
          onUntimedAuctionChange={setIsUntimedAuctionChecked}
          standbySeconds={settingsStandbySeconds}
        />
      ) : null}
    </main>
  );
}

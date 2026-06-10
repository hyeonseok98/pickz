import { getDraftRoomStreamerPool } from "@/apis/draft";
import type { AuctionPageState } from "@/types/draft";
import { parseDraftRoomSnapshot } from "@/utils";
import {
  createAuctionPageStateFromSnapshot,
  createAuctionPageStateFromStreamerPool,
} from "@/utils/draft/auction";
import { cache } from "react";
import { AuctionBidControlPanel } from "./_components/auction-bid-control-panel";
import { AuctionBidLogSection } from "./_components/auction-bid-log-section";
import { AuctionMainStageSection } from "./_components/auction-main-stage-section";
import { auctionPageMockState } from "./_components/auction-page.mock";
import { AuctionStreamerQueueSection } from "./_components/auction-streamer-queue-section";
import { AuctionTeamRosterSection } from "./_components/auction-team-roster-section";
import { AuctionUnsoldStreamerSection } from "./_components/auction-unsold-streamer-section";

interface AuctionPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : (value ?? null);
}

function parseRoomId(roomIdValue: string | null) {
  if (!roomIdValue) {
    return null;
  }

  const roomId = Number(roomIdValue);

  return Number.isInteger(roomId) && roomId > 0 ? roomId : null;
}

const loadAuctionStreamerPool = cache(async (roomId: number) => {
  return getDraftRoomStreamerPool(roomId);
});

async function loadAuctionPageState(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<AuctionPageState> {
  const snapshot = parseDraftRoomSnapshot(getSearchParamValue(searchParams, "config"));

  if (snapshot) {
    return createAuctionPageStateFromSnapshot(snapshot);
  }

  const roomId = parseRoomId(getSearchParamValue(searchParams, "roomId"));

  if (!roomId) {
    return auctionPageMockState;
  }

  try {
    const streamerPool = await loadAuctionStreamerPool(roomId);

    return createAuctionPageStateFromStreamerPool({
      roomTitle: `방 ${roomId} 경매 드래프트`,
      streamerPool,
    });
  } catch (error) {
    console.error("[auction page] failed to load streamer pool", {
      error,
      roomId,
    });

    return auctionPageMockState;
  }
}

export default async function AuctionPage({ searchParams }: AuctionPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const auctionPageState = await loadAuctionPageState(resolvedSearchParams);
  const hostTeam = auctionPageState.teamStates[0];

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-[#f7f5ff] px-2 py-2 sm:px-3 xl:h-[calc(100dvh-var(--header-height))] xl:overflow-hidden">
      <div className="mx-auto flex w-full max-w-430 justify-center xl:h-full">
        <div className="grid w-full max-w-415 gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,26rem)_minmax(0,28.5rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,31rem)_minmax(0,30rem)_minmax(0,1fr)]">
          <AuctionTeamRosterSection
            initialPoints={auctionPageState.initialTeamPoints}
            teamStates={auctionPageState.teamStates}
          />

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,10rem)] 2xl:grid-rows-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,10rem)]">
            <AuctionMainStageSection
              currentHighestBidAmount={auctionPageState.currentHighestBidAmount}
              currentHighestBidTeamName={auctionPageState.currentHighestBidTeamName}
              currentPhase={auctionPageState.currentPhase}
              currentStreamer={auctionPageState.currentStreamer}
              remainSeconds={auctionPageState.remainSeconds}
            />

            <AuctionBidLogSection logs={auctionPageState.logs} />
            <AuctionBidControlPanel
              currentHighestBidAmount={auctionPageState.currentHighestBidAmount}
              remainingPoints={hostTeam?.remainingPoints ?? 0}
              remainSeconds={auctionPageState.remainSeconds}
            />
          </div>

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(0,1fr)_144px]">
            <AuctionStreamerQueueSection streamers={auctionPageState.upcomingStreamers} />
            <AuctionUnsoldStreamerSection streamers={auctionPageState.unbidStreamers} />
          </div>
        </div>
      </div>
    </main>
  );
}

import { parseDraftRoomSnapshot } from "@/utils";
import { AuctionBidControlPanel } from "./_components/auction-bid-control-panel";
import { AuctionBidLogSection } from "./_components/auction-bid-log-section";
import { AuctionMainStageSection } from "./_components/auction-main-stage-section";
import {
  auctionPageMockState,
  createAuctionPageStateFromSnapshot,
} from "./_components/auction-page.mock";
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

export default async function AuctionPage({ searchParams }: AuctionPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const snapshot = parseDraftRoomSnapshot(getSearchParamValue(resolvedSearchParams, "config"));
  const auctionPageState = snapshot
    ? createAuctionPageStateFromSnapshot(snapshot)
    : auctionPageMockState;
  const hostTeam = auctionPageState.teamStates[0];

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-[#f7f5ff] px-1.5 py-2 xl:h-[calc(100dvh-var(--header-height))] xl:overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1720px] justify-center xl:h-full">
        <div className="grid w-full max-w-[1660px] gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[500px_360px_612px] 2xl:grid-cols-[520px_458px_640px]">
          <AuctionTeamRosterSection
            initialPoints={auctionPageState.initialTeamPoints}
            teamStates={auctionPageState.teamStates}
          />

          <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[280px_minmax(160px,1fr)_150px]">
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

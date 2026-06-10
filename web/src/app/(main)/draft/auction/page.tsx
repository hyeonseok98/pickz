import { getDraftRoomStreamerPool } from "@/apis/draft";
import type { AuctionPageState } from "@/types/draft";
import { parseDraftRoomSnapshot } from "@/utils";
import {
  createAuctionPageStateFromSnapshot,
  createAuctionPageStateFromStreamerPool,
} from "@/utils/draft/auction";
import { cache } from "react";
import { auctionPageMockState } from "./_components/auction-page.mock";
import { AuctionPageClient } from "./_components/auction-page-client";

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

  return (
    <AuctionPageClient initialAuctionPageState={auctionPageState} />
  );
}

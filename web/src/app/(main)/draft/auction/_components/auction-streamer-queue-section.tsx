import { ArrowForwardIcon } from "@/components/common/icons";
import { Badge, Button, SectionCard } from "@/components/common/ui";
import type { AuctionStreamer } from "@/types/draft/auction";
import { AuctionStreamerTile } from "./auction-streamer-tile";

interface AuctionStreamerQueueSectionProps {
  isGameStarted: boolean;
  onOpenCoachOrderPanel: () => void;
  onResetAuctionGame: () => void;
  onShuffleAuctionOrder: () => void;
  onStartAuctionGame: () => void;
  streamers: AuctionStreamer[];
}

export function AuctionStreamerQueueSection({
  isGameStarted,
  onOpenCoachOrderPanel,
  onResetAuctionGame,
  onShuffleAuctionOrder,
  onStartAuctionGame,
  streamers,
}: AuctionStreamerQueueSectionProps) {
  const queueColumnCount = 5;

  return (
    <SectionCard
      padding="sm"
      className="min-h-[430px] overflow-hidden border-violet-100/80 bg-white/90 xl:h-full xl:min-h-0"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onResetAuctionGame}
          >
            다시하기
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isGameStarted}
            onClick={onOpenCoachOrderPanel}
          >
            감독 순서
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isGameStarted}
            onClick={onShuffleAuctionOrder}
          >
            순서 변경
          </Button>
          <Button type="button" size="sm" disabled={isGameStarted} onClick={onStartAuctionGame}>
            시작하기
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">
            경매 순서
          </h2>
          <Badge tone="neutral" variant="soft" size="md">
            {streamers.length}명
          </Badge>
        </div>

        <div className="grid min-h-0 grid-cols-2 content-start gap-x-4 gap-y-2 overflow-y-auto pr-1 md:grid-cols-4 xl:grid-cols-5">
          {streamers.map((streamer, index) => {
            const isLastInRow = index % queueColumnCount === queueColumnCount - 1;
            const isLastItem = index === streamers.length - 1;

            return (
              <div key={streamer.id} className="relative">
                <AuctionStreamerTile size="sm" streamer={streamer} />
                {!isLastInRow && !isLastItem ? (
                  <span className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-violet-300 xl:block">
                    <ArrowForwardIcon className="size-3" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

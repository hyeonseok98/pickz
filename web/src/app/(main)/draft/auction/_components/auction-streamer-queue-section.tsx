import { ArrowForwardIcon } from "@/components/common/icons";
import { Badge, Button, SectionCard } from "@/components/common/ui";
import type { AuctionStreamer } from "@/types/draft/auction";
import { AuctionStreamerTile } from "./auction-streamer-tile";

interface AuctionStreamerQueueSectionProps {
  isGameFinished: boolean;
  isGameStarted: boolean;
  isGameSettingsDisabled?: boolean;
  onExitRoom: () => void;
  onOpenGameSettings: () => void;
  onResetAuctionGame: () => void;
  onShuffleAuctionOrder: () => void;
  onStartAuctionGame: () => void;
  streamers: AuctionStreamer[];
}

export function AuctionStreamerQueueSection({
  isGameFinished,
  isGameStarted,
  isGameSettingsDisabled = false,
  onExitRoom,
  onOpenGameSettings,
  onResetAuctionGame,
  onShuffleAuctionOrder,
  onStartAuctionGame,
  streamers,
}: AuctionStreamerQueueSectionProps) {
  const queueColumnCount = 5;

  return (
    <SectionCard
      padding="sm"
      className="min-h-[430px] overflow-hidden rounded-2xl border-violet-100/80 bg-white/90 lg:h-full lg:min-h-0"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Button type="button" variant="secondary" size="sm" className="!shadow-none" onClick={onResetAuctionGame}>
            다시하기
          </Button>
          <Button type="button" variant="secondary" size="sm" className="!shadow-none" onClick={onExitRoom}>
            방 나가기
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="!shadow-none"
            disabled={isGameStarted || isGameFinished}
            onClick={onShuffleAuctionOrder}
          >
            순서 섞기
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="!shadow-none"
            disabled={isGameStarted || isGameFinished || isGameSettingsDisabled}
            onClick={onOpenGameSettings}
          >
            게임 설정
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isGameStarted || isGameFinished}
            className="!shadow-none"
            onClick={onStartAuctionGame}
          >
            게임 시작
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">경매 순서</h2>
          <Badge tone="neutral" variant="soft" size="md">
            남은 인원: {streamers.length}명
          </Badge>
        </div>

        <div className="grid min-h-0 grid-cols-2 content-start gap-x-6 gap-y-2 overflow-y-auto pr-1 md:grid-cols-4 lg:grid-cols-5">
          {streamers.map((streamer, index) => {
            const isLastInRow = index % queueColumnCount === queueColumnCount - 1;
            const isLastItem = index === streamers.length - 1;

            return (
              <div key={streamer.id} className="relative">
                <AuctionStreamerTile size="sm" streamer={streamer} />
                {!isLastInRow && !isLastItem ? (
                  <span className="pointer-events-none absolute top-1/2 -right-4.5 hidden -translate-y-1/2 text-violet-300 lg:block">
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

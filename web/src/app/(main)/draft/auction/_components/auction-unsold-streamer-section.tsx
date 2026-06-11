import { ArrowForwardIcon } from "@/components/common/icons";
import { SectionCard } from "@/components/common/ui";
import type { AuctionStreamer } from "@/types/draft/auction";
import { AuctionStreamerTile } from "./auction-streamer-tile";

interface AuctionUnsoldStreamerSectionProps {
  isAutoAssignmentReady?: boolean;
  streamers: AuctionStreamer[];
}

export function AuctionUnsoldStreamerSection({
  isAutoAssignmentReady = false,
  streamers,
}: AuctionUnsoldStreamerSectionProps) {
  const queueColumnCount = 5;

  return (
    <SectionCard
      padding="sm"
      className="min-h-[220px] overflow-hidden rounded-2xl border-violet-100/80 bg-white/90"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">
            유찰 순서
          </h2>
        </div>
        <div className="min-h-0 overflow-y-auto pr-1">
          {streamers.length > 0 ? (
            <div className="grid gap-2">
              {isAutoAssignmentReady ? (
                <p className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
                  재경매 2회차가 끝나면 남은 선수는 남은 팀에 랜덤 배정됩니다.
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 lg:grid-cols-5">
                {streamers.map((streamer, index) => {
                  const isLastInRow = index % queueColumnCount === queueColumnCount - 1;
                  const isLastItem = index === streamers.length - 1;

                  return (
                    <div key={`${streamer.id}-${index}`} className="relative">
                      <AuctionStreamerTile size="sm" streamer={streamer} />
                      {!isLastInRow && !isLastItem ? (
                        <span className="pointer-events-none absolute -right-[18px] top-1/2 hidden -translate-y-1/2 text-violet-300 lg:block">
                          <ArrowForwardIcon className="size-3" />
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-violet-100 bg-white/60 text-sm font-semibold text-text-muted">
              아직 유찰된 선수가 없습니다
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

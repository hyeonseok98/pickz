import { Badge, SectionCard } from "@/components/common/ui";
import type { AuctionStreamer } from "@/types/draft/auction";
import { AuctionStreamerTile } from "./auction-streamer-tile";

interface AuctionUnsoldStreamerSectionProps {
  streamers: AuctionStreamer[];
}

export function AuctionUnsoldStreamerSection({
  streamers,
}: AuctionUnsoldStreamerSectionProps) {
  return (
    <SectionCard
      padding="sm"
      className="min-h-[144px] overflow-hidden border-violet-100/80 bg-white/90 xl:h-full"
      contentClassName="h-full"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">
          유찰 순서
        </h2>
        <Badge tone="warning" variant="soft" size="md">
          2회
        </Badge>
      </div>

      <div className="mt-2 min-h-0 overflow-y-auto pr-1">
        {streamers.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
            {streamers.map((streamer) => (
              <AuctionStreamerTile key={streamer.id} size="sm" streamer={streamer} />
            ))}
          </div>
        ) : (
          <div className="flex h-[68px] items-center justify-center rounded-2xl border border-dashed border-violet-100 bg-white/60 text-sm font-semibold text-text-muted">
            아직 유찰된 선수가 없습니다
          </div>
        )}
      </div>
    </SectionCard>
  );
}

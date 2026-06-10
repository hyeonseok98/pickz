import { AvatarNameCard, Badge } from "@/components/common/ui";
import type { AuctionStreamer } from "@/types/draft/auction";
import { getAuctionLineLabel } from "@/utils/draft/auction";

interface AuctionStreamerTileProps {
  badge?: string;
  size?: "md" | "sm";
  streamer: AuctionStreamer;
}

export function AuctionStreamerTile({ badge, size = "md", streamer }: AuctionStreamerTileProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={
        isSmall
          ? "relative rounded-xl border border-violet-100 bg-white/84 px-1.5 py-1.5 shadow-surface-sm"
          : "relative rounded-2xl border border-violet-100 bg-white/84 px-2 py-2 shadow-surface-sm"
      }
    >
      {badge ? (
        <Badge
          tone="warning"
          variant="solid"
          className="absolute -right-1.5 -top-2 z-10 h-5 px-2 text-xs"
        >
          {badge}
        </Badge>
      ) : null}
      <AvatarNameCard
        avatarSize="sm"
        avatarClassName={isSmall ? "size-7" : undefined}
        className={isSmall ? "gap-1 rounded-lg bg-transparent px-0.5 py-0" : "gap-1 rounded-xl bg-transparent px-1 py-0.5"}
        imageUrl={streamer.profileImageUrl}
        name={streamer.name}
        nameClassName="text-xs"
      />
      <p className="mt-0.5 text-center text-xs font-semibold text-text-secondary">
        {getAuctionLineLabel(streamer.line)}
      </p>
    </div>
  );
}

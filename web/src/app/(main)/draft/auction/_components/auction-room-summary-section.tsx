import { Badge, SectionCard, StatusChip } from "@/components/common/ui";
import {
  auctionBidIncrementOptions,
  auctionBiddingSeconds,
  auctionInitialTeamPoints,
  auctionMaxReauctionCount,
  pickzInvitational2026Name,
} from "@/constants/draft";
import { CoinIcon, GavelLineIcon, TimerIcon } from "./auction-icons";

export function AuctionRoomSummarySection() {
  return (
    <SectionCard
      padding="sm"
      className="bg-[linear-gradient(135deg,#ffffff_0%,#f9fafb_48%,#fff7ed_100%)]"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <GavelLineIcon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-text-secondary">프리셋</p>
            <p className="text-sm font-bold text-text-primary">{pickzInvitational2026Name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <CoinIcon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-text-secondary">초기 포인트</p>
            <p className="text-sm font-bold text-text-primary">{auctionInitialTeamPoints}P</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-info-50 text-info-700">
            <TimerIcon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-text-secondary">입찰 시간</p>
            <p className="text-sm font-bold text-text-primary">{auctionBiddingSeconds}초</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <StatusChip tone="warning">재경매 {auctionMaxReauctionCount}회</StatusChip>
          <Badge tone="neutral" variant="outline" size="md">
            {auctionBidIncrementOptions.map((amount) => `+${amount}`).join(" / ")}
          </Badge>
        </div>
      </div>
    </SectionCard>
  );
}

import Link from "next/link";
import { ArrowBackIcon } from "@/components/common/icons";
import { Badge, StatusChip } from "@/components/common/ui";

interface AuctionPageTopBarProps {
  currentHighestBidAmount: number;
  currentPhaseLabel: string;
  roomTitle: string;
}

export function AuctionPageTopBar({
  currentHighestBidAmount,
  currentPhaseLabel,
  roomTitle,
}: AuctionPageTopBarProps) {
  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border bg-surface px-4 py-3 shadow-surface-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/draft"
          aria-label="드래프트로 돌아가기"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-subtle text-text-primary transition-colors hover:bg-surface-muted"
        >
          <ArrowBackIcon className="size-4" />
        </Link>
        <h1 className="truncate text-xl font-bold tracking-[-0.04em] text-text-primary lg:text-2xl">
          {roomTitle}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone="active">{currentPhaseLabel}</StatusChip>
        <Badge tone="warning" variant="soft" size="md">
          최고가 {currentHighestBidAmount}P
        </Badge>
        <Link
          href="/draft"
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted"
        >
          나가기
        </Link>
      </div>
    </section>
  );
}

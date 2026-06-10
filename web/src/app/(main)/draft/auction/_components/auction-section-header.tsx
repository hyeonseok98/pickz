import type { ReactNode } from "react";

interface AuctionSectionHeaderProps {
  description?: string;
  icon?: ReactNode;
  title: string;
  trailing?: ReactNode;
}

export function AuctionSectionHeader({
  description,
  icon,
  title,
  trailing,
}: AuctionSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-[-0.03em] text-text-primary">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
          ) : null}
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

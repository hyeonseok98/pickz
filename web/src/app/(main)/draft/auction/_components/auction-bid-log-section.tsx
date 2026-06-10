"use client";

import { useEffect, useRef } from "react";
import { SectionCard } from "@/components/common/ui";
import type { AuctionChatMessage } from "@/types/draft/auction";

interface AuctionBidLogSectionProps {
  logs: AuctionChatMessage[];
}

export function AuctionBidLogSection({ logs }: AuctionBidLogSectionProps) {
  const logListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logListElement = logListRef.current;

    if (!logListElement) {
      return;
    }

    logListElement.scrollTop = logListElement.scrollHeight;
  }, [logs]);

  return (
    <SectionCard
      padding="sm"
      className="min-h-[180px] border-violet-100/80 bg-white/90 xl:h-full xl:min-h-0"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2">
        <h2 className="text-base font-black tracking-[-0.03em] text-text-primary">경매 로그</h2>
        <div
          ref={logListRef}
          className="max-h-[260px] min-h-0 overflow-y-auto rounded-2xl border border-violet-100 bg-white/70 xl:max-h-none"
        >
          <div className="divide-y divide-violet-50">
            {logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-3 px-4 py-2 text-sm"
              >
                <span className="shrink-0 text-xs font-semibold text-text-muted">
                  {log.sentAt}
                </span>
                <p className="min-w-0 truncate font-semibold text-text-primary">
                  {log.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

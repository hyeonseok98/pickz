"use client";

import { useEffect, useRef } from "react";
import { SectionCard } from "@/components/common/ui";
import type { AuctionChatMessage } from "@/types/draft/auction";
import { cn } from "@/utils";

interface AuctionBidLogSectionProps {
  logs: AuctionChatMessage[];
}

const auctionLogToneClassNames = {
  danger: "font-black text-rose-600",
  lineAdc: "text-fuchsia-600",
  lineJungle: "text-emerald-600",
  lineMid: "text-sky-600",
  lineSupport: "text-cyan-600",
  lineTop: "text-amber-600",
  muted: "text-text-muted",
  primary: "text-violet-700",
  success: "font-black text-green-600",
  teamFour: "text-pink-700",
  teamFive: "text-slate-700",
  teamOne: "text-violet-700",
  teamThree: "text-cyan-700",
  teamTwo: "text-orange-700",
  warning: "text-orange-600",
} as const;

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
      className="min-h-[180px] rounded-2xl border-violet-100/80 bg-white/90 lg:h-full lg:min-h-0"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2">
        <h2 className="text-base font-black tracking-[-0.03em] text-text-primary">경매 로그</h2>
        <div
          ref={logListRef}
          className="max-h-[260px] min-h-0 overflow-y-auto rounded-xl border border-violet-100 bg-white/70 lg:max-h-none"
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
                <p className="min-w-0 font-semibold break-keep text-text-primary">
                  {log.segments?.length ? (
                    log.segments.map((segment, index) => (
                      <span
                        key={`${log.id}-${index}`}
                        className={cn(
                          segment.tone ? auctionLogToneClassNames[segment.tone] : undefined,
                        )}
                      >
                        {segment.text}
                      </span>
                    ))
                  ) : (
                    log.message
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

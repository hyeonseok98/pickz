import Image from "next/image";
import type { DraftRoomSettingsSummaryItem } from "@/hooks/draft";

interface DraftSettingsSummaryProps {
  items: DraftRoomSettingsSummaryItem[];
}

export function DraftSettingsSummary({ items }: DraftSettingsSummaryProps) {
  return (
    <aside className="rounded-3xl border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-4">
      <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">설정 요약</h2>
      <div className="mt-3 space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-3xl border border-border bg-surface-muted px-3.5 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-violet-100">
              <Image src={item.iconSrc} alt="" width={18} height={18} aria-hidden className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-text-secondary">{item.label}</span>
              <span className="mt-1 block truncate text-sm font-bold text-violet-700">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

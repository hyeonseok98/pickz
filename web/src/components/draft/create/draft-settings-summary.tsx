import Image from "next/image";
import type { DraftRoomSettingsSummaryItem } from "@/hooks/drafts";

interface DraftSettingsSummaryProps {
  items: DraftRoomSettingsSummaryItem[];
}

export function DraftSettingsSummary({ items }: DraftSettingsSummaryProps) {
  return (
    <aside className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm">
      <h2 className="text-lg font-bold text-text-primary">설정 요약</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
              <Image src={item.iconSrc} alt="" width={24} height={24} aria-hidden className="size-6" />
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

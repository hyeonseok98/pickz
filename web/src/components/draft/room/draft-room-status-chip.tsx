import type { ReactNode } from "react";
import { cn } from "@/utils";

interface DraftRoomStatusChipProps {
  children: ReactNode;
  tone?: "default" | "active" | "muted";
}

export function DraftRoomStatusChip({
  children,
  tone = "default",
}: DraftRoomStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
        tone === "active"
          ? "border-violet-300 bg-violet-100 text-violet-700"
          : tone === "muted"
            ? "border-border bg-surface-muted text-text-secondary"
            : "border-border bg-surface text-text-secondary",
      )}
    >
      {children}
    </span>
  );
}

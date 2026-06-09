import type { ReactNode } from "react";
import { StatusChip } from "@/components/common/ui";

interface DraftRoomStatusChipProps {
  children: ReactNode;
  tone?: "default" | "active" | "muted";
}

export function DraftRoomStatusChip({
  children,
  tone = "default",
}: DraftRoomStatusChipProps) {
  return <StatusChip tone={tone === "default" ? "neutral" : tone}>{children}</StatusChip>;
}

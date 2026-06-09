import type { ReactNode } from "react";
import { cn } from "@/utils";

interface DraftRoomSectionCardProps {
  children: ReactNode;
  className?: string;
  description: string;
  title: string;
}

export function DraftRoomSectionCard({
  children,
  className,
  description,
  title,
}: DraftRoomSectionCardProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-4.5",
        className,
      )}
    >
      <div className="shrink-0">
        <h2 className="text-base font-bold tracking-[-0.03em] text-text-primary sm:text-lg">{title}</h2>
        <p className="mt-1.5 text-xs leading-5 text-text-secondary">{description}</p>
      </div>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
  );
}

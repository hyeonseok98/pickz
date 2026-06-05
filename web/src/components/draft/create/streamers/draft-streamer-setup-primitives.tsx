import { DraftStreamerCard } from "@/components/draft/streamer-card";
import { cn } from "@/utils";
import type { LineKey } from "@/types/drafts";
import type { DragEvent, ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-text-primary">{children}</p>;
}

export function SectionCard({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description: string;
  title: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6", className)}>
      <div>
        <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function StatusChip({
  active,
  children,
  className,
  tone = "default",
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
        active
          ? "border-violet-300 bg-violet-100 text-violet-700"
          : tone === "muted"
            ? "border-border bg-surface-muted text-text-secondary"
            : "border-border bg-surface text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SelectField({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      className="h-12 w-full cursor-pointer rounded-2xl border border-border bg-surface px-4 text-sm text-text-primary outline-none transition focus:border-violet-300"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface BoardSlotProps {
  draggable?: boolean;
  dropReady?: boolean;
  isMobileViewport?: boolean;
  onClear?: () => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDropStreamer: (event: DragEvent<HTMLDivElement>) => void;
  onPlaceSelected?: () => void;
  onSelectStreamer?: () => void;
  onStreamerDragEnd?: (event: DragEvent<HTMLDivElement>) => void;
  onStreamerDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  selected?: boolean;
  streamer?: {
    avatarDataUrl: string;
    id: string;
    line: LineKey;
    name: string;
    note?: string;
  };
  touchReady?: boolean;
}

export function BoardSlot({
  draggable = false,
  dropReady = false,
  isMobileViewport = false,
  onClear,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDropStreamer,
  onPlaceSelected,
  onSelectStreamer,
  onStreamerDragEnd,
  onStreamerDragStart,
  selected = false,
  streamer,
  touchReady = false,
}: BoardSlotProps) {
  if (streamer) {
    return (
      <DraftStreamerCard
        avatarDataUrl={streamer.avatarDataUrl}
        interaction={isMobileViewport ? "select" : draggable ? "drag" : "static"}
        name={streamer.name}
        onClick={onSelectStreamer}
        onDragEnd={onStreamerDragEnd}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDragStart={onStreamerDragStart}
        onDrop={onDropStreamer}
        onRemove={onClear}
        removeLabel={`${streamer.name} 제거`}
        size="slot"
        tone={selected ? "active" : dropReady || touchReady ? "drop" : "default"}
      />
    );
  }

  return (
    <div
      onDrop={onDropStreamer}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      className={cn(
        "relative rounded-3xl border p-2.5 transition-all",
        dropReady || touchReady
          ? "border-violet-300 bg-violet-50 shadow-sm"
          : "border-border bg-surface hover:border-violet-200",
      )}
    >
      <button
        type="button"
        onClick={onPlaceSelected}
        className={cn(
          "flex min-h-20 w-full flex-col items-center justify-center rounded-2xl px-2 text-center",
          onPlaceSelected ? "cursor-pointer" : "cursor-default",
        )}
      >
        <span className="text-xl font-light text-text-muted">+</span>
        <p className="mt-1 text-xs font-semibold text-text-secondary">
          {dropReady ? "여기에 드롭" : touchReady ? "탭해서 배치" : "스트리머 배치"}
        </p>
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";
import { cn } from "@/utils";
import type {
  DragEventHandler,
  MouseEventHandler,
  ReactNode,
} from "react";

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden="true">
      <path d="m6 6 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m14 6-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type StreamerCardTone = "default" | "active" | "drop";
type StreamerCardInteraction = "drag" | "select" | "static";
type StreamerCardSize = "default" | "slot";

interface DraftStreamerCardProps {
  avatarDataUrl: string;
  className?: string;
  helperText?: ReactNode;
  interaction?: StreamerCardInteraction;
  name: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
  onDragEnter?: DragEventHandler<HTMLDivElement>;
  onDragLeave?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
  removeLabel?: string;
  size?: StreamerCardSize;
  tone?: StreamerCardTone;
}

export function DraftStreamerCard({
  avatarDataUrl,
  className,
  helperText,
  interaction = "static",
  name,
  onClick,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDragStart,
  onDrop,
  onRemove,
  removeLabel,
  size = "default",
  tone = "default",
}: DraftStreamerCardProps) {
  const cardContent = (
    <>
      <Image
        src={avatarDataUrl}
        alt={name}
        width={48}
        height={48}
        unoptimized
        className={cn(
          "rounded-full bg-surface object-cover",
          size === "slot" ? "size-10" : "size-11",
        )}
      />
      <span
        className={cn(
          "block max-w-full truncate whitespace-nowrap text-xs font-semibold text-text-primary",
          size === "slot" ? "mt-2" : "mt-3",
        )}
      >
        {name}
      </span>

      {helperText ? (
        <span className="mt-1 block max-w-full truncate whitespace-nowrap text-xs font-medium text-violet-700">
          {helperText}
        </span>
      ) : null}
    </>
  );

  return (
    <div
      draggable={interaction === "drag"}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      className={cn(
        "relative rounded-3xl border transition-all",
        "p-2.5",
        interaction === "drag" && "cursor-grab active:cursor-grabbing",
        tone === "active"
          ? "border-violet-300 bg-violet-100 shadow-sm"
          : tone === "drop"
            ? "border-violet-300 bg-violet-50 shadow-sm"
            : "border-border bg-surface-muted",
        className,
      )}
    >
      {onRemove ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(event);
          }}
          className="absolute right-2 top-2 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-surface text-text-secondary shadow-sm"
          aria-label={removeLabel ?? `${name} 제거`}
        >
          <CloseIcon />
        </button>
      ) : null}

      {interaction === "select" ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl px-2 text-center",
            size === "slot" ? "min-h-20" : "min-h-22",
          )}
        >
          {cardContent}
        </button>
      ) : (
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-2xl px-2 text-center",
            size === "slot" ? "min-h-20" : "min-h-22",
            interaction === "drag" && "pointer-events-none",
          )}
        >
          {cardContent}
        </div>
      )}
    </div>
  );
}

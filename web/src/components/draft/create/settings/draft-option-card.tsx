import Image from "next/image";
import { cn } from "@/utils";
import type { ReactNode } from "react";

interface DraftOptionCardProps {
  description: ReactNode;
  iconSrc: string;
  isSelected: boolean;
  label: ReactNode;
  onClick: () => void;
}

export function DraftOptionCard({
  description,
  iconSrc,
  isSelected,
  label,
  onClick,
}: DraftOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-24 w-full cursor-pointer items-center gap-3 rounded-3xl border px-4 py-3.5 text-left transition-colors",
        isSelected
          ? "border-violet-400 bg-violet-50 text-violet-700"
          : "border-border bg-surface text-text-primary hover:border-violet-200",
      )}
    >
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-full",
          isSelected ? "bg-violet-100" : "bg-surface-muted",
        )}
      >
          <Image src={iconSrc} alt="" width={24} height={24} aria-hidden className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-text-secondary">{description}</span>
      </span>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border",
          isSelected ? "border-violet-600 bg-violet-600" : "border-border bg-surface",
        )}
      >
        {isSelected ? (
          <span className="size-2.5 rounded-full bg-surface" />
        ) : null}
      </span>
    </button>
  );
}

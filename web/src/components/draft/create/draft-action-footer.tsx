import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils";
import type { ReactNode } from "react";

interface DraftActionFooterProps {
  className?: string;
  description?: ReactNode;
  primaryDisabled?: boolean;
  primaryLabel: string;
  onPrimaryClick: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
  title?: ReactNode;
}

export function DraftActionFooter({
  className,
  description,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: DraftActionFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
        {title ? <p className="text-sm font-semibold text-text-primary">{title}</p> : null}
        {description ? (
          <p className={cn("text-sm leading-6 text-text-secondary", title ? "mt-2" : "")}>
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 text-sm font-bold text-text-primary"
          >
            <Image
              src="/icons/arrow_back.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="size-4"
            />
            <span>{secondaryLabel}</span>
          </Link>
        ) : null}

        <button
          type="button"
          onClick={onPrimaryClick}
          disabled={primaryDisabled}
          className={cn(
            "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition-colors",
            primaryDisabled
              ? "cursor-not-allowed bg-surface-muted text-text-muted"
              : "cursor-pointer bg-text-primary text-text-inverse",
          )}
        >
          <span>{primaryLabel}</span>
          <Image
            src="/icons/arrow_forward.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden
            className="size-4"
          />
        </button>
      </div>
    </div>
  );
}

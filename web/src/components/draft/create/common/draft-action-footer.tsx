import Link from "next/link";
import { ArrowBackIcon, ArrowForwardIcon } from "@/components/common/icons";
import { Button } from "@/components/common/ui";
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
        "flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="rounded-2xl border border-border bg-surface-muted px-4 py-2.5 lg:max-w-xl">
        {title ? <p className="text-sm font-semibold text-text-primary">{title}</p> : null}
        {description ? (
          <p className={cn("text-sm leading-5 text-text-secondary", title ? "mt-1.5" : "")}>
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 text-sm font-bold text-text-primary"
          >
            <ArrowBackIcon className="size-4" />
            <span>{secondaryLabel}</span>
          </Link>
        ) : null}

        <Button
          onClick={onPrimaryClick}
          disabled={primaryDisabled}
          variant="primary"
          className="lg:min-w-[220px]"
          trailingIcon={<ArrowForwardIcon className="size-4" />}
        >
          <span>{primaryLabel}</span>
        </Button>
      </div>
    </div>
  );
}

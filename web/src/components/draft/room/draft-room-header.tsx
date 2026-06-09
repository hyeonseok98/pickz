import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface DraftRoomHeaderProps {
  action?: ReactNode;
  backHref?: string;
  backLabel: string;
  description: string;
  title: string;
}

function ArrowLeftIcon() {
  return (
    <Image src="/icons/arrow_back.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
  );
}

export function DraftRoomHeader({
  action,
  backHref,
  backLabel,
  description,
  title,
}: DraftRoomHeaderProps) {
  return (
    <section className="shrink-0 rounded-3xl border border-border bg-surface px-4 py-2.5 shadow-sm sm:px-5 sm:py-3">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-text-primary"
            >
              <ArrowLeftIcon />
              <span>{backLabel}</span>
            </Link>
          ) : null}

          <h1
            className={
              backHref
                ? "mt-2.5 text-[28px] font-bold tracking-[-0.04em] text-text-primary"
                : "text-[28px] font-bold tracking-[-0.04em] text-text-primary"
            }
          >
            {title}
          </h1>
          <p className="mt-1 text-xs leading-4.5 text-text-secondary">{description}</p>
        </div>

        {action ? <div className="flex flex-wrap gap-2 xl:justify-end">{action}</div> : null}
      </div>
    </section>
  );
}

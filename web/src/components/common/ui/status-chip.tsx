import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils";

const statusChipVariants = cva("inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "border-border bg-surface text-text-secondary",
      active: "border-violet-300 bg-violet-100 text-violet-700",
      muted: "border-border bg-surface-muted text-text-secondary",
      success: "border-success-200 bg-success-50 text-success-700",
      warning: "border-warning-200 bg-warning-50 text-warning-700",
      danger: "border-danger-200 bg-danger-50 text-danger-700",
      info: "border-info-200 bg-info-50 text-info-700",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

interface StatusChipProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusChipVariants> {}

export function StatusChip({ className, tone, ...props }: StatusChipProps) {
  return <span className={cn(statusChipVariants({ tone }), className)} {...props} />;
}


import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils";

const badgeVariants = cva("inline-flex items-center justify-center rounded-full border font-semibold whitespace-nowrap", {
  variants: {
    size: {
      sm: "h-6 px-2.5 text-[11px]",
      md: "h-7 px-3 text-xs",
    },
    tone: {
      neutral: "",
      brand: "",
      success: "",
      warning: "",
      danger: "",
    },
    variant: {
      solid: "",
      soft: "",
      outline: "",
    },
  },
  compoundVariants: [
    { tone: "neutral", variant: "solid", className: "border-border bg-surface text-text-primary" },
    { tone: "neutral", variant: "soft", className: "border-border bg-surface-muted text-text-secondary" },
    { tone: "neutral", variant: "outline", className: "border-border bg-transparent text-text-secondary" },
    { tone: "brand", variant: "solid", className: "border-violet-600 bg-violet-600 text-text-inverse" },
    { tone: "brand", variant: "soft", className: "border-violet-200 bg-violet-100 text-violet-700" },
    { tone: "brand", variant: "outline", className: "border-violet-300 bg-transparent text-violet-700" },
    { tone: "success", variant: "solid", className: "border-success-500 bg-success-500 text-text-inverse" },
    { tone: "success", variant: "soft", className: "border-success-200 bg-success-50 text-success-700" },
    { tone: "success", variant: "outline", className: "border-success-300 bg-transparent text-success-700" },
    { tone: "warning", variant: "solid", className: "border-warning-500 bg-warning-500 text-text-inverse" },
    { tone: "warning", variant: "soft", className: "border-warning-200 bg-warning-50 text-warning-700" },
    { tone: "warning", variant: "outline", className: "border-warning-300 bg-transparent text-warning-700" },
    { tone: "danger", variant: "solid", className: "border-danger-500 bg-danger-500 text-text-inverse" },
    { tone: "danger", variant: "soft", className: "border-danger-200 bg-danger-50 text-danger-700" },
    { tone: "danger", variant: "outline", className: "border-danger-300 bg-transparent text-danger-700" },
  ],
  defaultVariants: {
    size: "sm",
    tone: "neutral",
    variant: "soft",
  },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, size, tone, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ size, tone, variant }), className)} {...props} />;
}


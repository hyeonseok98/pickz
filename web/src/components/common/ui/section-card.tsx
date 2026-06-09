import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

const sectionCardVariants = cva("rounded-3xl border shadow-surface-sm", {
  variants: {
    variant: {
      default: "border-border bg-surface",
      muted: "border-border bg-surface-muted",
      elevated: "border-border bg-surface shadow-surface-lg",
    },
    padding: {
      sm: "p-4",
      md: "px-4 py-4 sm:px-5 sm:py-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

interface SectionCardProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionCardVariants> {
  children: ReactNode;
  contentClassName?: string;
  description?: string;
  headerEnd?: ReactNode;
  title?: string;
}

export function SectionCard({
  children,
  className,
  contentClassName,
  description,
  headerEnd,
  padding,
  title,
  variant,
  ...props
}: SectionCardProps) {
  return (
    <section className={cn(sectionCardVariants({ variant, padding }), className)} {...props}>
      {title || description || headerEnd ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-base font-bold tracking-[-0.03em] text-text-primary sm:text-lg">{title}</h2> : null}
            {description ? <p className="mt-1.5 text-sm leading-5 text-text-secondary">{description}</p> : null}
          </div>
          {headerEnd ? <div className="shrink-0">{headerEnd}</div> : null}
        </div>
      ) : null}
      <div className={cn(title || description || headerEnd ? "mt-4" : "", contentClassName)}>{children}</div>
    </section>
  );
}

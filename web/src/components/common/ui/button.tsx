import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap font-semibold transition-colors outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-text-muted",
  {
    variants: {
      variant: {
        primary:
          "bg-violet-600 text-text-inverse shadow-action-primary hover:bg-violet-700 active:bg-violet-800",
        secondary:
          "border border-border bg-surface-subtle text-text-primary hover:bg-surface-muted active:bg-surface-subtle",
        outline:
          "border border-violet-300 bg-surface text-violet-700 hover:border-violet-400 hover:bg-violet-50 active:border-violet-500 active:bg-violet-100",
        ghost: "bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary active:bg-surface-subtle",
        danger:
          "bg-danger-500 text-text-inverse shadow-action-danger hover:bg-danger-600 active:bg-danger-700",
      },
      size: {
        sm: "h-8 gap-1.5 rounded-xl px-3 text-[13px]",
        md: "h-10 gap-2 rounded-2xl px-4 text-sm",
        lg: "h-12 gap-2 rounded-2xl px-5 text-[15px]",
        iconSm: "size-8 rounded-xl",
        iconMd: "size-10 rounded-2xl",
        iconLg: "size-12 rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

const buttonIconVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-[18px]",
      lg: "size-5",
      iconSm: "size-4",
      iconMd: "size-[18px]",
      iconLg: "size-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  children,
  className,
  disabled,
  fullWidth,
  isLoading = false,
  leadingIcon,
  size,
  trailingIcon,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={isDisabled}
      {...props}
    >
      {leadingIcon ? <span className={buttonIconVariants({ size })}>{leadingIcon}</span> : null}
      {isLoading ? <span>처리 중</span> : children}
      {trailingIcon ? <span className={buttonIconVariants({ size })}>{trailingIcon}</span> : null}
    </button>
  );
}

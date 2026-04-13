import { cn } from "@/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-360 px-4 sm:px-6 xl:px-8", className)} {...props}>
      {children}
    </div>
  );
}

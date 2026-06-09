import Image from "next/image";
import type { ReactNode } from "react";
import { PersonOutlineIcon } from "@/components/common/icons";
import { cn } from "@/utils";

interface AvatarNameCardProps {
  avatarAlt?: string;
  avatarClassName?: string;
  avatarFallback?: ReactNode;
  avatarSize?: "sm" | "md";
  className?: string;
  imageUrl?: string | null;
  name: string;
  nameClassName?: string;
}

export function AvatarNameCard({
  avatarAlt = "",
  avatarClassName,
  avatarFallback,
  avatarSize = "md",
  className,
  imageUrl,
  name,
  nameClassName,
}: AvatarNameCardProps) {
  const avatarSizeClassName = avatarSize === "sm" ? "size-10" : "size-12";
  const iconSizeClassName = avatarSize === "sm" ? "size-5" : "size-6";

  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-2xl bg-surface-muted px-3 py-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-text-muted",
          avatarSizeClassName,
          avatarClassName,
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={avatarAlt}
            width={avatarSize === "sm" ? 40 : 48}
            height={avatarSize === "sm" ? 40 : 48}
            className="size-full object-cover"
          />
        ) : avatarFallback ? (
          avatarFallback
        ) : (
          <PersonOutlineIcon className={iconSizeClassName} />
        )}
      </div>
      <p className={cn("line-clamp-1 text-center text-sm font-semibold text-text-primary", nameClassName)}>{name}</p>
    </div>
  );
}


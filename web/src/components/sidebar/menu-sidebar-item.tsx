"use client";

import { useSidebarContext } from "@/contexts/sidebar.context";
import type { MenuSidebarItem as MenuSidebarItemData } from "@/types";
import { cn } from "@/utils";
import Link from "next/link";
import type { MouseEvent } from "react";

interface MenuSidebarItemProps {
  item: MenuSidebarItemData;
  className?: string;
}

export function MenuSidebarItem({ item, className }: MenuSidebarItemProps) {
  const { closeSidebar } = useSidebarContext();
  const { badge, disabled = false, href, icon, label, onClick } = item;

  const itemClassName = cn(
    "group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-medium transition-colors",
    "bg-transparent text-text-primary hover:border-border hover:bg-surface-muted",
    disabled && "cursor-not-allowed opacity-60 hover:border-transparent hover:bg-transparent",
    className,
  );

  const content = (
    <>
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text-secondary transition-colors group-hover:bg-surface-subtle group-hover:text-text-primary">
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 flex-1 truncate">{label}</span>

      {badge !== undefined && badge !== null ? (
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
          {badge}
        </span>
      ) : null}
    </>
  );

  const runClickHandler = () => {
    if (onClick) {
      onClick();
    }

    closeSidebar();
  };

  const handleButtonClick = () => {
    if (disabled) {
      return;
    }

    runClickHandler();
  };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    runClickHandler();
  };

  if (href) {
    return (
      <Link
        href={href}
        className={itemClassName}
        onClick={handleLinkClick}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={itemClassName}
      onClick={handleButtonClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

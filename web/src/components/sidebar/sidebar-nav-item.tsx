"use client";

import type { MenuSidebarItem } from "@/types";
import { cn } from "@/utils";
import Link from "next/link";

interface SidebarNavItemProps {
  item: MenuSidebarItem;
  active: boolean;
  collapsed?: boolean;
  onSelect?: () => void;
}

export function SidebarNavItem({
  item,
  active,
  collapsed = false,
  onSelect,
}: SidebarNavItemProps) {
  const { disabled = false, href, icon, label, onClick } = item;

  const itemClassName = cn(
    "group relative flex w-full items-center rounded-xl border text-sm font-medium transition-all duration-200",
    collapsed ? "h-10 justify-center px-0" : "h-11 gap-3 px-3",
    active &&
      !collapsed &&
      "border-border bg-linear-to-r from-surface via-violet-100 to-violet-200 text-text-primary shadow-sm",
    active && collapsed && "border-transparent bg-transparent text-text-primary",
    !active &&
      "border-transparent bg-transparent text-text-secondary hover:border-border hover:bg-surface hover:text-text-primary",
    disabled &&
      "cursor-not-allowed opacity-50 hover:border-transparent hover:bg-transparent hover:text-text-secondary",
  );

  const iconClassName = cn(
    "flex shrink-0 items-center justify-center rounded-lg transition-all duration-200",
    collapsed ? "size-9" : "size-8",
    active &&
      collapsed &&
      "border border-border bg-linear-to-br from-surface via-violet-100 to-violet-200 shadow-sm",
    active && !collapsed && "bg-surface text-text-primary",
    !collapsed && "text-current",
  );

  const content = (
    <>
      <span className={iconClassName}>{icon}</span>

      {!collapsed ? (
        <span className="pointer-events-none absolute inset-x-0 text-center text-sm">{label}</span>
      ) : null}

      {collapsed ? (
        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
          {label}
        </span>
      ) : null}
    </>
  );

  const runSelectHandler = () => {
    if (disabled) {
      return;
    }

    if (onClick) {
      onClick();
    }

    if (onSelect) {
      onSelect();
    }
  };

  if (href) {
    return (
      <Link
        href={href}
        className={itemClassName}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }

          if (onClick) {
            onClick();
          }

          if (onSelect) {
            onSelect();
          }
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={itemClassName}
      onClick={runSelectHandler}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      {content}
    </button>
  );
}

"use client";

import type { MenuSidebarItem } from "@/types";
import { cn } from "@/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type SVGProps } from "react";

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.75 10v10h10.5V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 3v3" strokeLinecap="round" />
      <path d="M17 3v3" strokeLinecap="round" />
      <path d="M4 9h16" strokeLinecap="round" />
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
    </svg>
  );
}

function DraftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 5.5h10" strokeLinecap="round" />
      <path d="M7 9.5h10" strokeLinecap="round" />
      <path d="M7 13.5h6" strokeLinecap="round" />
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    </svg>
  );
}

function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 4h8v2.5A4 4 0 0 1 12 10.5 4 4 0 0 1 8 6.5V4Z" />
      <path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5 3.5 3.5 0 0 0 7.5 10H8" strokeLinecap="round" />
      <path d="M16 5h2.5A1.5 1.5 0 0 1 20 6.5 3.5 3.5 0 0 1 16.5 10H16" strokeLinecap="round" />
      <path d="M12 10.5V15" strokeLinecap="round" />
      <path d="M9 19h6" strokeLinecap="round" />
      <path d="M10 15h4v4h-4z" />
    </svg>
  );
}

function AddIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 5v14" strokeLinecap="round" />
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 12h8" strokeLinecap="round" />
      <path d="m13 7 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface ExampleSidebarNavItemProps {
  item: MenuSidebarItem;
  active: boolean;
  collapsed: boolean;
}

function ExampleSidebarNavItem({ item, active, collapsed }: ExampleSidebarNavItemProps) {
  const { disabled = false, href = "/", icon, label } = item;

  const itemClassName = cn(
    "group relative flex w-full cursor-pointer items-center rounded-xl border text-sm font-medium transition-all duration-200",
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

  return (
    <Link
      href={href}
      className={itemClassName}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled}
      aria-label={label}
      tabIndex={disabled ? -1 : undefined}
    >
      <span className={iconClassName}>{icon}</span>

      {!collapsed ? (
        <span className="pointer-events-none absolute inset-x-0 text-center text-sm">{label}</span>
      ) : null}

      {collapsed ? (
        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
          {label}
        </span>
      ) : null}
    </Link>
  );
}

interface MenuSidebarExampleProps {
  collapsed?: boolean;
}

export function MenuSidebarExample({ collapsed = false }: MenuSidebarExampleProps) {
  const pathname = usePathname();

  const primaryItems = [
    {
      key: "home",
      label: "홈",
      icon: <HomeIcon className="size-4" />,
      href: "/",
    },
    {
      key: "schedule",
      label: "일정",
      icon: <CalendarIcon className="size-4" />,
      href: "/schedule",
    },
    {
      key: "draft",
      label: "드래프트",
      icon: <DraftIcon className="size-4" />,
      href: "/draft",
    },
    {
      key: "competition",
      label: "대회",
      icon: <TrophyIcon className="size-4" />,
      href: "/competition",
    },
  ] satisfies MenuSidebarItem[];

  return (
    <aside
      className={cn(
        "fixed top-20 bottom-0 left-0 z-40 py-4 transition-[width,padding] duration-300 ease-out",
        collapsed ? "w-20 px-3" : "w-70 px-4",
      )}
    >
      <div className="flex h-full flex-col rounded-3xl border border-border/80 bg-linear-to-b from-surface/85 via-surface/75 to-surface-muted/80 shadow-lg backdrop-blur-2xl">
        <nav
          className={cn(
            "flex flex-1 flex-col justify-between",
            collapsed ? "px-2 py-5" : "px-3 py-5",
          )}
        >
          <div className="space-y-3">
            {!collapsed ? (
              <p className="px-3 text-xs font-semibold tracking-[0.22em] text-text-muted uppercase">
                메뉴
              </p>
            ) : null}

            <div className="space-y-2.5">
              {primaryItems.map((item) => {
                const href = item.href ?? "/";

                return (
                  <ExampleSidebarNavItem
                    key={item.key}
                    item={item}
                    active={isActivePath(pathname, href)}
                    collapsed={collapsed}
                  />
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              className={cn(
                "group relative w-full cursor-pointer overflow-hidden transition-all duration-200",
                collapsed
                  ? "h-10 rounded-none border-transparent bg-transparent px-0 shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none"
                  : "h-20 rounded-2xl border border-border bg-linear-to-r from-surface via-violet-100 to-violet-200 px-3 shadow-sm hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md",
              )}
            >
              <span
                aria-hidden={!collapsed}
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                  collapsed ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-text-primary text-text-inverse shadow-sm">
                  <AddIcon className="size-4" />
                </span>
              </span>

              <span
                aria-hidden={collapsed}
                className={cn(
                  "absolute inset-0 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 text-left transition-opacity duration-200",
                  collapsed ? "pointer-events-none opacity-0" : "opacity-100",
                )}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-text-primary text-text-inverse shadow-sm">
                  <AddIcon className="size-4" />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-primary">제보하기</span>
                  <span className="mt-1 block text-xs text-text-muted">
                    합방 일정과 대회 결과를 남길 수 있어요
                  </span>
                </span>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors group-hover:text-text-primary">
                  <ArrowRightIcon className="size-4" />
                </span>
              </span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}

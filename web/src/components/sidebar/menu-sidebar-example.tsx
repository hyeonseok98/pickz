"use client";

import type { MenuSidebarItem } from "@/types";
import { cn } from "@/utils";
import Link from "next/link";
import { useState, type MouseEvent, type SVGProps } from "react";

function BrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
      <path
        d="M9 8.5h4.3a3.2 3.2 0 0 1 0 6.4H9V8.5Zm2.1 1.9V13h2.1a1.3 1.3 0 0 0 0-2.6h-2.1Z"
        fill="#f8fafc"
      />
    </svg>
  );
}

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

function NotificationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 4a4 4 0 0 0-4 4v2.8c0 .7-.2 1.4-.7 1.9L6 14.5h12l-1.3-1.8a3 3 0 0 1-.7-1.9V8a4 4 0 0 0-4-4Z" />
      <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m12 2.8 1.7 4.8L18.5 9l-4.8 1.7-1.7 4.8-1.7-4.8L5.5 9l4.8-1.4L12 2.8Z" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19 12a7 7 0 0 0-.1-1l1.7-1.3-1.7-3-2 .8a7.7 7.7 0 0 0-1.7-1L15 4h-6l-.2 2.5a7.7 7.7 0 0 0-1.7 1l-2-.8-1.7 3L5.1 11a7 7 0 0 0 0 2l-1.7 1.3 1.7 3 2-.8a7.7 7.7 0 0 0 1.7 1L9 20h6l.2-2.5a7.7 7.7 0 0 0 1.7-1l2 .8 1.7-3-1.7-1.3c.1-.3.1-.7.1-1Z" />
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

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

interface ExampleServiceItem {
  key: string;
  label: string;
  icon: string;
  iconClassName: string;
}

function SidebarSectionLabel({
  children,
  collapsed,
}: {
  children: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return null;
  }

  return (
    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7d8798]">
      {children}
    </p>
  );
}

interface ExampleSidebarNavItemProps {
  item: MenuSidebarItem;
  active: boolean;
  collapsed: boolean;
  onSelect: (item: MenuSidebarItem) => void;
}

function ExampleSidebarNavItem({
  item,
  active,
  collapsed,
  onSelect,
}: ExampleSidebarNavItemProps) {
  const { badge, disabled = false, href, icon, label } = item;

  const itemClassName = cn(
    "group relative flex h-12 w-full items-center overflow-hidden rounded-2xl border text-sm font-medium transition-all duration-300 ease-out",
    collapsed ? "justify-center gap-0 px-0" : "justify-start gap-3 px-3",
    active
      ? "border-[#dce9ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,255,255,0.7)_18%,rgba(206,233,255,0.9)_58%,rgba(255,231,215,0.92)_100%)] text-[#0f172a] shadow-[0_18px_34px_rgba(148,163,184,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]"
      : "border-transparent bg-transparent text-[#4b5563] hover:border-black/5 hover:bg-white/65 hover:text-[#111827]",
    disabled && "cursor-not-allowed opacity-45 hover:border-transparent hover:bg-transparent hover:text-[#4b5563]",
  );

  const content = (
    <>
      <span
        className={cn(
          "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
          active
            ? "border-white/70 bg-white/80 text-[#0f172a] shadow-[0_10px_22px_rgba(255,255,255,0.55)]"
            : "border-black/5 bg-white/45 text-current group-hover:bg-white/75",
        )}
      >
        {icon}
      </span>

      {!collapsed ? (
        <>
          <span className="pointer-events-none absolute left-1/2 top-1/2 max-w-[calc(100%-7.5rem)] -translate-x-1/2 -translate-y-1/2 truncate text-center tracking-[-0.02em]">
            {label}
          </span>

          {badge !== undefined && badge !== null ? (
            <span
              className={cn(
                "relative z-10 ml-auto rounded-full px-2 py-1 text-[11px] font-semibold",
                active ? "bg-white/80 text-[#0f172a]" : "bg-black/5 text-[#475569]",
              )}
            >
              {badge}
            </span>
          ) : null}
        </>
      ) : null}
    </>
  );

  const handleSelect = () => {
    if (disabled) {
      return;
    }

    onSelect(item);
  };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onSelect(item);
  };

  if (href) {
    return (
      <Link
        href={href}
        className={itemClassName}
        onClick={handleLinkClick}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        title={collapsed ? label : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={itemClassName}
      onClick={handleSelect}
      disabled={disabled}
      aria-pressed={active}
      title={collapsed ? label : undefined}
    >
      {content}
    </button>
  );
}

export function MenuSidebarExample() {
  const collapsed = false;
  const [activeKey, setActiveKey] = useState("home");

  const primaryItems = [
    {
      key: "home",
      label: "홈",
      icon: <HomeIcon className="size-4" />,
      href: "/#home",
    },
    {
      key: "schedule",
      label: "합방 일정",
      icon: <CalendarIcon className="size-4" />,
      badge: 4,
    },
    {
      key: "draft",
      label: "모의 드래프트",
      icon: <DraftIcon className="size-4" />,
      badge: "HOT",
    },
    {
      key: "bracket",
      label: "대진",
      icon: <TrophyIcon className="size-4" />,
    },
    {
      key: "notifications",
      label: "알림",
      icon: <NotificationIcon className="size-4" />,
    },
    {
      key: "spotlight",
      label: "하이라이트",
      icon: <SparklesIcon className="size-4" />,
    },
  ] satisfies MenuSidebarItem[];

  const secondaryItems = [
    {
      key: "settings",
      label: "설정",
      icon: <SettingsIcon className="size-4" />,
    },
  ] satisfies MenuSidebarItem[];

  const serviceItems = [
    {
      key: "live",
      label: "Live",
      icon: "L",
      iconClassName:
        "bg-[linear-gradient(135deg,#ffd6e9_0%,#ffbfd9_100%)] text-[#9f1853]",
    },
    {
      key: "draft-room",
      label: "Draft",
      icon: "D",
      iconClassName:
        "bg-[linear-gradient(135deg,#edf3ff_0%,#dbeafe_100%)] text-[#2855b1]",
    },
    {
      key: "tourney",
      label: "Cup",
      icon: "T",
      iconClassName:
        "bg-[linear-gradient(135deg,#fff2d9_0%,#ffe1b3_100%)] text-[#9a5600]",
    },
    {
      key: "plus",
      label: "Add",
      icon: "+",
      iconClassName: "bg-white/75 text-[#475569]",
    },
  ] satisfies ExampleServiceItem[];

  const handleSelect = (item: MenuSidebarItem) => {
    setActiveKey(item.key);

    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 isolate w-70 px-4 py-4"
    >
      <div className="absolute inset-x-4 top-5 h-40 rounded-[36px] bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(196,233,255,0.8),transparent_30%),radial-gradient(circle_at_58%_90%,rgba(255,227,214,0.7),transparent_36%)] blur-3xl" />

      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,255,255,0.68)_100%)] shadow-[0_28px_60px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-[28px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.16)_28%,rgba(255,255,255,0.22)_100%)]" />
        <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),transparent_68%)] blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(211,234,255,0.74),transparent_66%)] blur-3xl" />
        <div className="absolute right-12 top-48 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,230,214,0.65),transparent_72%)] blur-3xl" />

        <div className="relative px-5 pt-5">
          <div className="flex min-h-11 items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827_0%,#334155_100%)] text-white shadow-[0_16px_32px_rgba(15,23,42,0.22)]">
                <BrandIcon className="size-5" />
              </span>

              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold tracking-[-0.03em] text-[#0f172a]">
                    Pick:Z
                  </p>
                  <p className="truncate text-xs text-[#6b7280]">Modern Glass Workspace</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative px-5 pt-5">
          <div
            className={cn(
              "overflow-hidden rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.45))] p-4 shadow-[0_16px_34px_rgba(148,163,184,0.12),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl transition-all duration-500",
              collapsed ? "flex items-center justify-center px-0 py-4" : "space-y-4",
            )}
          >
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(174,222,255,0.9),rgba(255,213,189,0.84))] blur-md" />
                <div className="relative flex size-14 items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(135deg,#dff2ff_0%,#b9dcff_48%,#ffd8c7_100%)] text-base font-semibold text-[#0f172a] shadow-[0_14px_28px_rgba(148,163,184,0.18)]">
                  Z
                </div>
              </div>

              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-[21px] font-semibold tracking-[-0.04em] text-[#0f172a]">
                    Pick:Z Team
                  </p>
                  <p className="truncate text-xs text-[#6b7280]">Streamer Operations</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="relative flex flex-1 flex-col justify-between px-4 pb-5 pt-5">
          <div className="space-y-4">
            <SidebarSectionLabel collapsed={collapsed}>Menu</SidebarSectionLabel>

            <div className="space-y-1.5">
              {primaryItems.map((item) => {
                return (
                  <ExampleSidebarNavItem
                    key={item.key}
                    item={item}
                    active={activeKey === item.key}
                    collapsed={collapsed}
                    onSelect={handleSelect}
                  />
                );
              })}
            </div>

            <SidebarSectionLabel collapsed={collapsed}>Service</SidebarSectionLabel>

            <div
              className={cn(
                "rounded-[26px] border border-white/70 bg-white/50 p-3 shadow-[0_16px_30px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-2xl",
                collapsed && "px-2",
              )}
            >
              <div className={cn("grid gap-2", collapsed ? "grid-cols-1" : "grid-cols-4")}>
                {serviceItems.map((item) => {
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="group flex flex-col items-center gap-2 rounded-2xl px-2 py-2.5 transition-colors hover:bg-white/70"
                      aria-label={item.label}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-2xl border border-white/70 text-sm font-semibold shadow-[0_12px_20px_rgba(148,163,184,0.12)] transition-transform duration-300 group-hover:scale-[1.04]",
                          item.iconClassName,
                        )}
                      >
                        {item.icon}
                      </span>

                      {!collapsed ? (
                        <span className="text-[11px] font-medium text-[#7d8798]">{item.label}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SidebarSectionLabel collapsed={collapsed}>Setting</SidebarSectionLabel>

            <div className="space-y-1.5">
              {secondaryItems.map((item) => {
                return (
                  <ExampleSidebarNavItem
                    key={item.key}
                    item={item}
                    active={activeKey === item.key}
                    collapsed={collapsed}
                    onSelect={handleSelect}
                  />
                );
              })}
            </div>

            <button
              type="button"
              className={cn(
                "group relative overflow-hidden rounded-[28px] border border-white/80 shadow-[0_18px_34px_rgba(148,163,184,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-300 hover:-translate-y-0.5",
                collapsed
                  ? "flex h-[74px] items-center justify-center bg-[linear-gradient(135deg,#d8eeff_0%,#c6dfff_52%,#ffe1cf_100%)]"
                  : "bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(233,244,255,0.98)_46%,rgba(255,231,219,0.96)_100%)] p-[1px]",
              )}
            >
              {!collapsed ? (
                <div className="flex items-center gap-3 rounded-[27px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.68))] px-4 py-4 text-left backdrop-blur-2xl">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827_0%,#334155_100%)] text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
                    <AddIcon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0f172a]">새 프로젝트 만들기</p>
                    <p className="text-xs text-[#6b7280]">
                      일정과 드래프트를 바로 시작할 수 있어요
                    </p>
                  </div>
                </div>
              ) : (
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827_0%,#334155_100%)] text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
                  <AddIcon className="size-5" />
                </span>
              )}
            </button>

            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-[24px] border border-white/75 bg-white/52 shadow-[0_16px_30px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-2xl transition-colors hover:bg-white/72",
                collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3",
              )}
            >
              <span className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#edf6ff_0%,#dceaff_100%)] text-[#0f172a] shadow-[0_12px_22px_rgba(148,163,184,0.14)]">
                <UserIcon className="size-4" />
                <span className="absolute -right-1 -top-1 size-3 rounded-full border border-white bg-emerald-400" />
              </span>

              {!collapsed ? (
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-[#0f172a]">Jessica J.</p>
                  <p className="truncate text-xs text-[#7d8798]">Premium Workspace</p>
                </div>
              ) : null}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}

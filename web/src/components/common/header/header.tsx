"use client";

import Link from "next/link";
import type { SVGProps } from "react";
import { MobileSidebar } from "@/components/sidebar";

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

interface HeaderProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Header({ collapsed = false, onToggle }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-(--header-height) bg-surface">
      <div className="flex h-full items-center justify-between border-b border-border px-5 sm:px-6">
        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            aria-expanded={!collapsed}
            className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-surface text-text-primary transition-colors hover:bg-surface-muted"
          >
            <MenuIcon className="size-5" />
          </button>

          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold tracking-[0.24em] text-text-primary shadow-sm">
              logo
            </span>
            <span className="text-2xl font-semibold tracking-[-0.05em] text-text-primary">
              Pick:Z
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <MobileSidebar />

          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-3 text-xs font-semibold tracking-[0.2em] text-text-primary shadow-sm">
              logo
            </span>
            <span className="text-xl font-semibold tracking-[-0.04em] text-text-primary">
              Pick:Z
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-full border border-text-primary bg-text-primary px-5 text-sm font-semibold text-text-inverse transition-opacity hover:opacity-90"
        >
          로그인
        </button>
      </div>
    </header>
  );
}

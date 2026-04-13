"use client";

import { MenuSidebarExample } from "@/components/sidebar";
import { cn } from "@/utils";
import Link from "next/link";
import { useState, type ReactNode, type SVGProps } from "react";
import { Container } from "./container";

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

interface AppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export function AppShell({ children, contentClassName }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6 xl:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setSidebarCollapsed((previous) => {
                  return !previous;
                });
              }}
              aria-label={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 축소하기"}
              aria-expanded={!sidebarCollapsed}
              className="flex size-11 items-center justify-center rounded-2xl border border-border bg-surface text-text-primary transition-colors hover:bg-surface-muted"
            >
              <MenuIcon className="size-5" />
            </button>

            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-12 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold tracking-[0.24em] text-text-primary shadow-sm">
                logo
              </span>
              <span className="text-2xl font-semibold tracking-[-0.05em] text-text-primary">
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

      <div className="pt-20">
        <MenuSidebarExample collapsed={sidebarCollapsed} />

        <div
          className={cn(
            "min-w-0 transition-[padding] duration-300 ease-out",
            sidebarCollapsed ? "pl-24" : "pl-70",
          )}
        >
          <Container>
            <section
              className={cn("min-h-[calc(100vh-5rem)] py-6", contentClassName)}
              aria-label="페이지 콘텐츠 영역"
            >
              {children}
            </section>
          </Container>
        </div>
      </div>
    </main>
  );
}

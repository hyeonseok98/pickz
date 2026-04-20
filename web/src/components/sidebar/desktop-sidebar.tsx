"use client";

import { cn } from "@/utils";
import { AnimatePresence, motion } from "motion/react";
import type { SVGProps } from "react";
import { desktopSidebarMenuItems } from "./sidebar-menu-items";
import { SidebarNav } from "./sidebar-nav";

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

interface DesktopSidebarProps {
  collapsed?: boolean;
}

export function DesktopSidebar({ collapsed = false }: DesktopSidebarProps) {
  return (
    <motion.aside
      className="fixed top-(--header-height) right-auto bottom-0 left-0 z-40 hidden py-4 lg:block"
      initial={false}
      animate={{
        width: collapsed
          ? "var(--desktop-sidebar-collapsed-width)"
          : "var(--desktop-sidebar-width)",
        paddingLeft: collapsed ? "0.75rem" : "1rem",
        paddingRight: collapsed ? "0.75rem" : "1rem",
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex h-full flex-col rounded-2xl border border-border/80 bg-linear-to-b from-surface/85 via-surface/75 to-surface-muted/80 shadow-lg backdrop-blur-2xl">
        <motion.nav
          className="flex flex-1 flex-col justify-between"
          initial={false}
          animate={{
            paddingLeft: collapsed ? "0.5rem" : "0.75rem",
            paddingRight: collapsed ? "0.5rem" : "0.75rem",
            paddingTop: "1.25rem",
            paddingBottom: "1.25rem",
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="wait">
              {!collapsed ? (
                <motion.p
                  key="menu-label"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="px-3 text-xs font-semibold tracking-[0.22em] text-text-muted uppercase"
                >
                  메뉴
                </motion.p>
              ) : null}
            </AnimatePresence>

            <SidebarNav items={desktopSidebarMenuItems} collapsed={collapsed} />
          </div>

          <div className="pt-6">
            <motion.button
              type="button"
              initial={false}
              animate={{
                height: collapsed ? "2.5rem" : "5rem",
                borderRadius: collapsed ? "0rem" : "1rem",
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group relative block w-full cursor-pointer overflow-hidden",
                collapsed
                  ? "border-transparent bg-transparent px-0 shadow-none"
                  : "border border-border bg-linear-to-r from-surface via-violet-100 to-violet-200 px-3 shadow-sm",
              )}
              whileHover={collapsed ? undefined : { y: -2 }}
              aria-label="제보하기"
            >
              <AnimatePresence initial={false} mode="wait">
                {collapsed ? (
                  <motion.span
                    key="collapsed-cta"
                    aria-hidden={!collapsed}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.16 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-text-primary text-text-inverse shadow-sm">
                      <AddIcon className="size-4" />
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="expanded-cta"
                    aria-hidden={collapsed}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 text-left"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-text-primary text-text-inverse shadow-sm">
                      <AddIcon className="size-4" />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary">
                        제보하기
                      </span>
                      <span className="mt-1 block text-xs text-text-muted">
                        합방 일정과 대회 결과를 남길 수 있어요
                      </span>
                    </span>

                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors group-hover:text-text-primary">
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </div>
    </motion.aside>
  );
}

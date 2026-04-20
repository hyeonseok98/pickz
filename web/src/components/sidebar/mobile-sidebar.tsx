"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useState, type SVGProps } from "react";
import { desktopSidebarMenuItems } from "./sidebar-menu-items";
import { SidebarNav } from "./sidebar-nav";

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M4 12h16" strokeLinecap="round" />
      <path d="M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 6l12 12" strokeLinecap="round" />
      <path d="M18 6 6 18" strokeLinecap="round" />
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

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        aria-label="모바일 사이드바 열기"
        aria-expanded={isOpen}
        className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-surface text-text-primary transition-colors hover:bg-surface-muted lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={() => {
                setIsOpen(false);
              }}
              aria-hidden="true"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.9 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="absolute inset-y-0 left-0 flex w-full max-w-(--mobile-sidebar-max-width) flex-col border-r border-border bg-surface shadow-2xl"
            >
              <div className="flex h-(--header-height) items-center justify-between border-b border-border px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Link href="/" className="flex items-center gap-3">
                    <span className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-3 text-xs font-semibold tracking-[0.2em] text-text-primary shadow-sm">
                      logo
                    </span>
                    <span
                      id={titleId}
                      className="text-lg font-semibold tracking-[-0.04em] text-text-primary"
                    >
                      Pick:Z
                    </span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-surface text-text-primary transition-colors hover:bg-surface-muted"
                  aria-label="모바일 사이드바 닫기"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col px-4 py-4">
                <div className="flex h-full flex-col rounded-2xl border border-border/80 bg-linear-to-b from-surface/85 via-surface/75 to-surface-muted/80 p-3 shadow-lg backdrop-blur-2xl">
                  <nav className="flex h-full flex-col justify-between">
                    <div className="space-y-3">
                      <p className="px-3 text-xs font-semibold tracking-[0.22em] text-text-muted uppercase">
                        메뉴
                      </p>

                      <SidebarNav
                        items={desktopSidebarMenuItems}
                        onItemSelect={() => {
                          setIsOpen(false);
                        }}
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        className="group relative h-20 w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-linear-to-r from-surface via-violet-100 to-violet-200 px-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
                      >
                        <span className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-left">
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
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

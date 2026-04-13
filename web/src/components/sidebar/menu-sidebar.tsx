"use client";

import { SidebarContextProvider } from "@/contexts";
import { sidebarBackdropMotion, sidebarPanelMotion } from "@/lib";
import type { MenuSidebarProps, SidebarContextValue } from "@/types";
import { cn } from "@/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { MenuSidebarItem } from "./menu-sidebar-item";

export function MenuSidebar({
  title,
  items,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: MenuSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const titleId = useId();

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  const openSidebar = () => {
    setOpen(true);
  };

  const closeSidebar = () => {
    setOpen(false);
  };

  const toggleSidebar = () => {
    setOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!isControlled) {
          setInternalOpen(false);
        }

        if (onOpenChange) {
          onOpenChange(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isControlled, isOpen, onOpenChange]);

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

  const sidebarContextValue: SidebarContextValue = {
    isOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };

  return (
    <SidebarContextProvider value={sidebarContextValue}>
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-50">
            <motion.div
              {...sidebarBackdropMotion}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            <motion.aside
              {...sidebarPanelMotion}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-label={title ? undefined : "메뉴 사이드바"}
              className={cn(
                "absolute inset-y-0 left-0 flex w-full max-w-[320px] flex-col border-r border-border bg-surface shadow-2xl",
                className,
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="min-w-0">
                  {title ? (
                    <h2 id={titleId} className="truncate text-lg font-semibold text-text-primary">
                      {title}
                    </h2>
                  ) : (
                    <span className="text-sm font-medium text-text-secondary">메뉴</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeSidebar}
                  className="cursor-pointer rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle"
                  aria-label="사이드바 닫기"
                >
                  닫기
                </button>
              </div>

              <nav
                className="flex-1 overflow-y-auto px-3 py-4"
                aria-label={title ?? "메뉴 사이드바"}
              >
                <ul className="flex flex-col gap-2">
                  {items.map((item) => {
                    return (
                      <li key={item.key}>
                        <MenuSidebarItem item={item} />
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </SidebarContextProvider>
  );
}

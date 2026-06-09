"use client";

import { Container } from "@/components/layout/container";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
  collapsed?: boolean;
}

export function SidebarLayout({ children, collapsed = false }: SidebarLayoutProps) {
  const pathname = usePathname();
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const isWideDraftRoom =
    pathname.startsWith("/draft/snake") ||
    (pathname.startsWith("/drafts/") && pathname.endsWith("/play"));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  return (
    <div className="pt-(--header-height)">
      <DesktopSidebar collapsed={collapsed} />

      <motion.div
        initial={false}
        animate={{
          paddingLeft: isDesktopViewport
            ? collapsed
              ? "var(--desktop-sidebar-collapsed-width)"
              : "var(--desktop-sidebar-width)"
            : "0px",
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Container className={isWideDraftRoom ? "max-w-none px-4 sm:px-5 xl:px-6" : undefined}>
          <section
            className="min-h-[calc(100vh-var(--header-height))]"
            aria-label="페이지 콘텐츠 영역"
          >
            {children}
          </section>
        </Container>
      </motion.div>
    </div>
  );
}

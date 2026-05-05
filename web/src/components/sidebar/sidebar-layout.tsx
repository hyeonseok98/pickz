"use client";

import { Container } from "@/components/layout/container";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DesktopSidebar } from "./desktop-sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
  collapsed?: boolean;
}

export function SidebarLayout({ children, collapsed = false }: SidebarLayoutProps) {
  const pathname = usePathname();
  const isWideDraftRoom = pathname.startsWith("/draft/snake");

  return (
    <div className="pt-(--header-height)">
      <DesktopSidebar collapsed={collapsed} />

      <motion.div
        initial={false}
        animate={{
          paddingLeft: collapsed
            ? "var(--desktop-sidebar-collapsed-width)"
            : "var(--desktop-sidebar-width)",
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="lg:pl-0"
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

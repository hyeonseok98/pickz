"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/common/header";
import { SidebarLayout } from "@/components/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

interface MainLayoutFrameProps {
  children: ReactNode;
  defaultCollapsed: boolean;
}

function MainLayoutFrame({ children, defaultCollapsed }: MainLayoutFrameProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);

  return (
    <>
      <Header
        collapsed={sidebarCollapsed}
        onToggle={() => {
          setSidebarCollapsed((current) => !current);
        }}
      />
      <SidebarLayout collapsed={sidebarCollapsed}>{children}</SidebarLayout>
    </>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isSnakeDraftPage = pathname.startsWith("/draft/snake");

  return (
    <MainLayoutFrame
      key={isSnakeDraftPage ? "snake-draft-layout" : "default-main-layout"}
      defaultCollapsed={isSnakeDraftPage}
    >
      {children}
    </MainLayoutFrame>
  );
}

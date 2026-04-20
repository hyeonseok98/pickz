"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Header } from "@/components/common/header";
import { SidebarLayout } from "@/components/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

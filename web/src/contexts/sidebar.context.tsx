"use client";

import type { SidebarContextValue } from "@/types";
import { createContext, useContext, type ReactNode } from "react";

const SidebarContext = createContext<SidebarContextValue | null>(null);

SidebarContext.displayName = "SidebarContext";

interface SidebarContextProviderProps {
  value: SidebarContextValue;
  children: ReactNode;
}

export function SidebarContextProvider({
  value,
  children,
}: SidebarContextProviderProps) {
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);

  if (context === null) {
    throw new Error("useSidebarContext must be used within a MenuSidebar.");
  }

  return context;
}

export { SidebarContext };

import type { ReactNode } from "react";

export interface MenuSidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string | number;
}

export interface MenuSidebarProps {
  title?: string;
  items: MenuSidebarItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (nextOpen: boolean) => void;
  className?: string;
}

export interface SidebarContextValue {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

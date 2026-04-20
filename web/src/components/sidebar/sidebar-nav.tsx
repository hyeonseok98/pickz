"use client";

import type { MenuSidebarItem } from "@/types";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";

interface SidebarNavProps {
  items: MenuSidebarItem[];
  collapsed?: boolean;
  onItemSelect?: () => void;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  items,
  collapsed = false,
  onItemSelect,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const href = item.href ?? "/";
        const active = isActivePath(pathname, href);

        return (
          <li key={item.key}>
            <SidebarNavItem
              item={item}
              active={active}
              collapsed={collapsed}
              onSelect={onItemSelect}
            />
          </li>
        );
      })}
    </ul>
  );
}

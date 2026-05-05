import type { MenuSidebarItem } from "@/types";
import type { SVGProps } from "react";

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.75 10v10h10.5V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 3v3" strokeLinecap="round" />
      <path d="M17 3v3" strokeLinecap="round" />
      <path d="M4 9h16" strokeLinecap="round" />
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
    </svg>
  );
}

function DraftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 5.5h10" strokeLinecap="round" />
      <path d="M7 9.5h10" strokeLinecap="round" />
      <path d="M7 13.5h6" strokeLinecap="round" />
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    </svg>
  );
}

function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 4h8v2.5A4 4 0 0 1 12 10.5 4 4 0 0 1 8 6.5V4Z" />
      <path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5 3.5 3.5 0 0 0 7.5 10H8" strokeLinecap="round" />
      <path d="M16 5h2.5A1.5 1.5 0 0 1 20 6.5 3.5 3.5 0 0 1 16.5 10H16" strokeLinecap="round" />
      <path d="M12 10.5V15" strokeLinecap="round" />
      <path d="M9 19h6" strokeLinecap="round" />
      <path d="M10 15h4v4h-4z" />
    </svg>
  );
}

export const desktopSidebarMenuItems = [
  {
    key: "home",
    label: "홈",
    icon: <HomeIcon className="size-4" />,
    href: "/",
  },
  {
    key: "schedule",
    label: "일정",
    icon: <CalendarIcon className="size-4" />,
    href: "/schedule",
  },
  {
    key: "draft",
    label: "드래프트",
    icon: <DraftIcon className="size-4" />,
    href: "/draft",
  },
  {
    key: "competition",
    label: "대회",
    icon: <TrophyIcon className="size-4" />,
    href: "/competition",
  },
] satisfies MenuSidebarItem[];

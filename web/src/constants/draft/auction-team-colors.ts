export interface AuctionTeamColorClassNames {
  accentBackground: string;
  badge: string;
  border: string;
  gradient: string;
  progressBackground: string;
  ring: string;
  softBackground: string;
  text: string;
}

export const auctionTeamColorClassNames = [
  {
    accentBackground: "bg-violet-600",
    badge: "bg-violet-100 text-violet-700",
    border: "border-violet-500",
    gradient: "from-violet-500 to-indigo-500",
    progressBackground: "bg-violet-600",
    ring: "ring-violet-200",
    softBackground: "bg-violet-50",
    text: "text-violet-700",
  },
  {
    accentBackground: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700",
    border: "border-orange-500",
    gradient: "from-amber-500 to-orange-500",
    progressBackground: "bg-orange-500",
    ring: "ring-orange-200",
    softBackground: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    accentBackground: "bg-cyan-500",
    badge: "bg-cyan-100 text-cyan-700",
    border: "border-cyan-500",
    gradient: "from-cyan-500 to-teal-500",
    progressBackground: "bg-cyan-500",
    ring: "ring-cyan-200",
    softBackground: "bg-cyan-50",
    text: "text-cyan-700",
  },
  {
    accentBackground: "bg-pink-500",
    badge: "bg-pink-100 text-pink-700",
    border: "border-pink-500",
    gradient: "from-pink-500 to-fuchsia-500",
    progressBackground: "bg-pink-500",
    ring: "ring-pink-200",
    softBackground: "bg-pink-50",
    text: "text-pink-700",
  },
] as const satisfies readonly AuctionTeamColorClassNames[];

/** 팀 번호에 맞는 경매 팀 색상 클래스 반환 */
export function getAuctionTeamColorClassNames(teamSlot: number) {
  const colorIndex = Math.max(0, teamSlot - 1) % auctionTeamColorClassNames.length;

  return auctionTeamColorClassNames[colorIndex];
}

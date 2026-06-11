import { PersonOutlineIcon } from "@/components/common/icons";
import { SectionCard } from "@/components/common/ui";
import { getAuctionTeamColorClassNames } from "@/constants/draft";
import type { AuctionPlayerLine, AuctionTeamState } from "@/types/draft/auction";
import { cn } from "@/utils";
import { getAuctionLineLabel } from "@/utils/draft/auction";
import Image from "next/image";

interface AuctionTeamRosterSectionProps {
  initialPoints: number;
  onSelectTeam?: (teamId: number) => void;
  selectedTeamId: number | null;
  teamStates: AuctionTeamState[];
}

const auctionPlayerLineOrder: AuctionPlayerLine[] = ["top", "jungle", "mid", "adc", "support"];

export function AuctionTeamRosterSection({
  initialPoints,
  onSelectTeam,
  selectedTeamId,
  teamStates,
}: AuctionTeamRosterSectionProps) {
  const isCompactTeamRoster = teamStates.length >= 5;

  return (
    <SectionCard
      padding="sm"
      className="overflow-hidden rounded-2xl border-violet-100/80 bg-white/86 lg:h-full"
      contentClassName="h-full"
    >
      <div className={cn("grid h-full grid-rows-[auto_minmax(0,1fr)]", isCompactTeamRoster ? "gap-1.5" : "gap-3")}>
        <h2 className={cn("font-black tracking-[-0.03em] text-text-primary", isCompactTeamRoster ? "text-base" : "text-lg")}>팀 구성</h2>
        <div
          className={cn("grid min-h-0", isCompactTeamRoster ? "gap-1" : "gap-2")}
          style={{ gridTemplateRows: `repeat(${teamStates.length}, minmax(0, 1fr))` }}
        >
          {teamStates.map((teamState) => {
            const teamColorClassNames = getAuctionTeamColorClassNames(teamState.staff.teamSlot);
            const isTeamSelectable = Boolean(onSelectTeam);
            const isSelectedTeam = isTeamSelectable && selectedTeamId === teamState.teamId;

            return (
              <article
                key={teamState.teamId}
                className={cn(
                  "min-h-0 overflow-hidden rounded-lg border-2 bg-white/90 shadow-surface-sm transition-colors duration-150",
                  isCompactTeamRoster ? "px-2 py-1.5" : "px-3 py-2.5",
                  isSelectedTeam ? teamColorClassNames.border : "border-violet-100",
                  isTeamSelectable ? "cursor-pointer" : "",
                )}
                style={{
                  borderColor: isSelectedTeam ? teamColorClassNames.solidColor : undefined,
                }}
                onClick={() => {
                  onSelectTeam?.(teamState.teamId);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className={cn("truncate font-bold leading-none", isCompactTeamRoster ? "text-sm" : "text-base", teamColorClassNames.text)}>
                      {teamState.teamName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("font-bold text-violet-300", isCompactTeamRoster ? "text-[11px] leading-none" : "text-xs")}>잔여 포인트</p>
                    <p className={cn("leading-none font-bold text-violet-800", isCompactTeamRoster ? "text-lg" : "text-xl")}>
                      {teamState.remainingPoints}
                    </p>
                  </div>
                </div>

                <div className={cn("overflow-hidden rounded-full bg-violet-50", isCompactTeamRoster ? "mt-1 h-1" : "mt-2 h-1.5")}>
                  <div
                    className={cn("h-full rounded-full", teamColorClassNames.progressBackground)}
                    style={{
                      width: `${initialPoints > 0 ? Math.max(0, Math.min(100, (teamState.remainingPoints / initialPoints) * 100)) : 0}%`,
                    }}
                  />
                </div>

                <div className={cn("grid min-h-0 grid-cols-5", isCompactTeamRoster ? "mt-1 gap-1" : "mt-2 gap-1.5")}>
                  {auctionPlayerLineOrder.map((line) => {
                    const rosterSlot = teamState.roster[line];
                    const streamer = rosterSlot?.streamer;

                    return (
                      <div
                        key={`${teamState.teamId}-${line}`}
                        className="flex min-h-0 min-w-0 flex-col items-center gap-1 overflow-hidden"
                      >
                        <span
                          className={cn(
                            "flex w-full shrink-0 items-center justify-center rounded-md border border-violet-100 bg-white px-2 font-bold text-violet-600",
                            isCompactTeamRoster ? "h-4 text-[11px]" : "h-5 text-[12px]",
                          )}
                        >
                          {getAuctionLineLabel(line)}
                        </span>
                        <div
                          className={cn(
                            "flex w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-violet-100 bg-violet-50/70 px-1 text-center",
                            isCompactTeamRoster ? "h-14 py-0.5" : "h-[4.75rem] py-1",
                          )}
                        >
                          {streamer ? (
                            <div className="grid min-h-0 max-h-full min-w-0 max-w-full justify-items-center overflow-hidden">
                              <div
                                className={cn(
                                  "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white text-text-muted",
                                  isCompactTeamRoster ? "size-5" : "size-8",
                                )}
                              >
                                {streamer.profileImageUrl ? (
                                  <Image
                                    src={streamer.profileImageUrl}
                                    alt={streamer.name}
                                    width={isCompactTeamRoster ? 20 : 32}
                                    height={isCompactTeamRoster ? 20 : 32}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <PersonOutlineIcon className={isCompactTeamRoster ? "size-3" : "size-4"} />
                                )}
                              </div>
                              <span className="block max-w-full truncate whitespace-nowrap text-[11px] leading-[13px] font-bold text-text-primary">
                                {streamer.name}
                              </span>
                              <span className="block max-w-full truncate whitespace-nowrap text-[11px] leading-[13px] font-bold text-violet-600">
                                {rosterSlot.bidPoint}P
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-text-muted">대기</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

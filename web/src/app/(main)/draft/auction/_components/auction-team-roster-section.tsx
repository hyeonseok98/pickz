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
  return (
    <SectionCard
      padding="sm"
      className="overflow-hidden rounded-2xl border-violet-100/80 bg-white/86 lg:h-full"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3">
        <h2 className="text-lg font-black tracking-[-0.03em] text-text-primary">팀 구성</h2>
        <div className="grid min-h-0 grid-rows-4 gap-2">
          {teamStates.map((teamState) => {
            const teamColorClassNames = getAuctionTeamColorClassNames(teamState.staff.teamSlot);
            const isSelectedTeam = selectedTeamId === teamState.teamId;

            return (
              <article
                key={teamState.teamId}
                className={cn(
                  "min-h-0 rounded-lg border bg-white/90 px-3 py-2.5 shadow-surface-sm transition-colors",
                  isSelectedTeam
                    ? cn(
                      teamColorClassNames.border,
                      "ring-2 ring-inset",
                      teamColorClassNames.ring,
                    )
                    : "border-violet-100",
                  onSelectTeam ? "cursor-pointer" : "",
                )}
                onClick={() => {
                  onSelectTeam?.(teamState.teamId);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className={cn("truncate font-bold", teamColorClassNames.text)}>
                      {teamState.teamName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-violet-300">잔여 포인트</p>
                    <p className="text-xl leading-none font-bold text-violet-800">
                      {teamState.remainingPoints}
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-50">
                  <div
                    className={cn("h-full rounded-full", teamColorClassNames.progressBackground)}
                    style={{
                      width: `${initialPoints > 0 ? Math.max(0, Math.min(100, (teamState.remainingPoints / initialPoints) * 100)) : 0}%`,
                    }}
                  />
                </div>

                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {auctionPlayerLineOrder.map((line) => {
                    const rosterSlot = teamState.roster[line];
                    const streamer = rosterSlot?.streamer;

                    return (
                      <div
                        key={`${teamState.teamId}-${line}`}
                        className="flex min-w-0 flex-col items-center gap-1"
                      >
                        <span className="flex h-6 w-full items-center justify-center rounded-md border border-violet-100 bg-white px-2 text-sm font-bold text-violet-600">
                          {getAuctionLineLabel(line)}
                        </span>
                        <div className="flex min-h-20 w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-violet-100 bg-violet-50/70 px-1.5 py-1.5 text-center">
                          {streamer ? (
                            <div className="flex min-w-0 max-w-full flex-col items-center justify-center gap-1 overflow-hidden">
                              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white text-text-muted">
                                {streamer.profileImageUrl ? (
                                  <Image
                                    src={streamer.profileImageUrl}
                                    alt={streamer.name}
                                    width={32}
                                    height={32}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <PersonOutlineIcon className="size-4" />
                                )}
                              </div>
                              <span className="max-w-full truncate whitespace-nowrap text-xs font-bold text-text-primary">
                                {streamer.name}
                              </span>
                              <span className="whitespace-nowrap text-xs font-bold text-violet-600">
                                {rosterSlot.bidPoint}P
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-text-muted">대기</span>
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

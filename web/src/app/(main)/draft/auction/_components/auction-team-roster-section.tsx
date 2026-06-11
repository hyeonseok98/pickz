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

interface AuctionTeamRosterLayoutPreset {
  teamCardGapClassName: string;
  teamCardPaddingClassName: string;
  teamNameClassName: string;
  pointsLabelClassName: string;
  pointsValueClassName: string;
  progressBarClassName: string;
  rosterGridGapClassName: string;
  lineLabelClassName: string;
  slotCardClassName: string;
  avatarSizeClassName: string;
  avatarIconClassName: string;
  avatarImageSize: number;
  streamerNameClassName: string;
  bidPointClassName: string;
  emptyTextClassName: string;
  sectionGapClassName: string;
  teamGridGapClassName: string;
}

function getAuctionTeamRosterLayoutPreset(teamCount: number): AuctionTeamRosterLayoutPreset {
  if (teamCount >= 5) {
    return {
      avatarIconClassName: "size-3",
      avatarImageSize: 20,
      avatarSizeClassName: "size-5",
      bidPointClassName: "text-[11px] leading-[12px]",
      emptyTextClassName: "text-[11px]",
      lineLabelClassName: "h-4 text-[11px]",
      pointsLabelClassName: "text-[11px] leading-none",
      pointsValueClassName: "text-lg",
      progressBarClassName: "mt-1 h-1",
      rosterGridGapClassName: "mt-1 gap-1",
      sectionGapClassName: "gap-1.5",
      slotCardClassName: "h-[4.1rem] py-0.5",
      streamerNameClassName: "text-[11px] leading-[12px]",
      teamCardGapClassName: "gap-1",
      teamCardPaddingClassName: "px-2 py-1.5",
      teamGridGapClassName: "gap-1",
      teamNameClassName: "text-sm",
    };
  }

  return {
    avatarIconClassName: "size-4",
    avatarImageSize: 28,
    avatarSizeClassName: "size-7",
    bidPointClassName: "text-xs leading-4",
    emptyTextClassName: "text-xs",
    lineLabelClassName: "h-[1.15rem] text-xs",
    pointsLabelClassName: "text-xs",
    pointsValueClassName: "text-xl",
    progressBarClassName: "mt-2 h-1.5",
    rosterGridGapClassName: "mt-2 gap-1.5",
    sectionGapClassName: "gap-3",
    slotCardClassName: teamCount === 4 ? "h-[4.2rem] py-1" : "h-[4.65rem] py-1",
    streamerNameClassName: "text-xs leading-4",
    teamCardGapClassName: "gap-2",
    teamCardPaddingClassName: "px-3 py-2.5",
    teamGridGapClassName: "gap-2",
    teamNameClassName: "text-base",
  };
}

export function AuctionTeamRosterSection({
  initialPoints,
  onSelectTeam,
  selectedTeamId,
  teamStates,
}: AuctionTeamRosterSectionProps) {
  const teamCount = teamStates.length;
  const isCompactTeamRoster = teamCount >= 5;
  const layoutPreset = getAuctionTeamRosterLayoutPreset(teamCount);

  return (
    <SectionCard
      padding="sm"
      className="overflow-hidden rounded-2xl border-violet-100/80 bg-white/86 lg:h-full"
      contentClassName="h-full"
    >
      <div className={cn("grid h-full grid-rows-[auto_minmax(0,1fr)]", layoutPreset.sectionGapClassName)}>
        <h2 className={cn("font-black tracking-[-0.03em] text-text-primary", isCompactTeamRoster ? "text-base" : "text-lg")}>팀 구성</h2>
        <div
          className={cn("grid min-h-0", layoutPreset.teamGridGapClassName)}
          style={{ gridTemplateRows: `repeat(${teamCount}, minmax(0, 1fr))` }}
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
                  layoutPreset.teamCardPaddingClassName,
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
                    <p className={cn("truncate font-bold leading-none", layoutPreset.teamNameClassName, teamColorClassNames.text)}>
                      {teamState.teamName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("font-bold text-violet-300", layoutPreset.pointsLabelClassName)}>잔여 포인트</p>
                    <p className={cn("leading-none font-bold text-violet-800", layoutPreset.pointsValueClassName)}>
                      {teamState.remainingPoints}
                    </p>
                  </div>
                </div>

                <div className={cn("overflow-hidden rounded-full bg-violet-50", layoutPreset.progressBarClassName)}>
                  <div
                    className={cn("h-full rounded-full", teamColorClassNames.progressBackground)}
                    style={{
                      width: `${initialPoints > 0 ? Math.max(0, Math.min(100, (teamState.remainingPoints / initialPoints) * 100)) : 0}%`,
                    }}
                  />
                </div>

                <div className={cn("grid min-h-0 grid-cols-5", layoutPreset.rosterGridGapClassName)}>
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
                            layoutPreset.lineLabelClassName,
                          )}
                        >
                          {getAuctionLineLabel(line)}
                        </span>
                        <div
                          className={cn(
                            "flex w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-violet-100 bg-violet-50/70 px-1 text-center",
                            layoutPreset.slotCardClassName,
                          )}
                        >
                          {streamer ? (
                            <div className="grid min-h-0 max-h-full min-w-0 max-w-full justify-items-center overflow-hidden">
                              <div
                                className={cn(
                                  "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white text-text-muted",
                                  layoutPreset.avatarSizeClassName,
                                )}
                              >
                                {streamer.profileImageUrl ? (
                                  <Image
                                    src={streamer.profileImageUrl}
                                    alt={streamer.name}
                                    width={layoutPreset.avatarImageSize}
                                    height={layoutPreset.avatarImageSize}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <PersonOutlineIcon className={layoutPreset.avatarIconClassName} />
                                )}
                              </div>
                              <span className={cn("block max-w-full truncate whitespace-nowrap font-bold text-text-primary", layoutPreset.streamerNameClassName)}>
                                {streamer.name}
                              </span>
                              <span className={cn("block max-w-full truncate whitespace-nowrap font-bold text-violet-600", layoutPreset.bidPointClassName)}>
                                {rosterSlot.bidPoint}P
                              </span>
                            </div>
                          ) : (
                            <span className={cn("font-semibold text-text-muted", layoutPreset.emptyTextClassName)}>대기</span>
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

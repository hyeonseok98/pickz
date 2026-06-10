import { PersonOutlineIcon } from "@/components/common/icons";
import { AvatarNameCard, SectionCard } from "@/components/common/ui";
import type { AuctionPlayerLine, AuctionTeamState } from "@/types/draft/auction";
import { cn } from "@/utils";
import { getAuctionLineLabel } from "@/utils/draft/auction";

interface AuctionTeamRosterSectionProps {
  initialPoints: number;
  teamStates: AuctionTeamState[];
}

const auctionPlayerLineOrder: AuctionPlayerLine[] = ["top", "jungle", "mid", "adc", "support"];

const teamAccentClassNames = [
  "from-violet-500 to-indigo-500 text-violet-700",
  "from-amber-500 to-orange-500 text-amber-700",
  "from-cyan-500 to-teal-500 text-cyan-700",
  "from-pink-500 to-fuchsia-500 text-pink-700",
];

export function AuctionTeamRosterSection({
  initialPoints,
  teamStates,
}: AuctionTeamRosterSectionProps) {
  return (
    <SectionCard
      padding="sm"
      className="overflow-hidden border-violet-100/80 bg-white/86 xl:h-full"
      contentClassName="h-full"
    >
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3">
        <h2 className="text-lg font-black tracking-[-0.03em] text-text-primary">팀 구성</h2>
        <div className="grid min-h-0 content-center gap-3 overflow-y-auto pr-1">
          {teamStates.map((teamState, teamIndex) => (
            <article
              key={teamState.teamId}
              className="rounded-2xl border border-violet-100 bg-white/90 px-3 py-4 shadow-surface-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-surface-sm",
                      teamAccentClassNames[teamIndex % teamAccentClassNames.length],
                    )}
                  >
                    <PersonOutlineIcon className="size-4" />
                  </span>
                  <p className="truncate font-bold text-violet-700">{teamState.teamName}</p>
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-black whitespace-nowrap text-violet-600">
                    {teamIndex + 1}픽
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-violet-300">잔여 포인트</p>
                  <p className="text-xl leading-none font-black text-violet-800">
                    {teamState.remainingPoints}
                  </p>
                </div>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-50">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{
                    width: `${initialPoints > 0 ? Math.max(0, Math.min(100, (teamState.remainingPoints / initialPoints) * 100)) : 0}%`,
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {auctionPlayerLineOrder.map((line) => {
                  const streamer = teamState.roster[line];

                  return (
                    <div
                      key={`${teamState.teamId}-${line}`}
                      className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border border-violet-100 bg-violet-50/70 px-1 py-2 text-center"
                    >
                      {streamer ? (
                        <AvatarNameCard
                          avatarSize="md"
                          className="gap-1 rounded-lg bg-transparent px-0 py-0"
                          imageUrl={streamer.profileImageUrl}
                          name={streamer.name}
                          nameClassName="text-xs"
                        />
                      ) : (
                        <>
                          <span className="text-xs font-black text-violet-300">
                            {getAuctionLineLabel(line)}
                          </span>
                          <span className="text-xs font-semibold text-text-muted">대기</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

import { Badge, SectionCard, StatusChip } from "@/components/common/ui";
import type { AuctionPhase, AuctionStreamer } from "@/types/draft/auction";
import { createAuctionTurnAnnouncement, getAuctionLineLabel } from "@/utils/draft/auction";
import Image from "next/image";
import { TimerIcon } from "./auction-icons";

interface AuctionMainStageSectionProps {
  currentHighestBidAmount: number;
  currentHighestBidTeamName: string;
  currentPhase: AuctionPhase;
  currentStreamer: AuctionStreamer;
  remainSeconds: number;
}

const phaseLabelMap: Record<AuctionPhase, string> = {
  BIDDING: "경매 진행",
  COUNTDOWN: "카운트다운",
  EVALUATING: "결과 확인",
  FINISHED: "종료",
  ROUND_RESULT: "라운드 결과",
  STANDBY: "대기",
};

export function getAuctionPhaseLabel(phase: AuctionPhase) {
  return phaseLabelMap[phase];
}

export function AuctionMainStageSection({
  currentHighestBidAmount,
  currentHighestBidTeamName,
  currentPhase,
  currentStreamer,
  remainSeconds,
}: AuctionMainStageSectionProps) {
  const currentStreamerImageUrl = currentStreamer.profileImageUrl ?? "/streamer_profile/hejin.webp";

  return (
    <SectionCard
      padding="sm"
      className="relative min-h-[280px] overflow-hidden border-violet-100/80 bg-white/90 text-text-primary shadow-surface-lg xl:h-full xl:min-h-0"
      contentClassName="mt-0 h-full"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(124,58,237,0.18),transparent_36%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="relative grid h-full min-h-0 grid-cols-1 items-start gap-4 sm:grid-cols-[172px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)]">
        <div className="size-[172px] self-start overflow-hidden rounded-2xl bg-violet-100/70 shadow-surface-sm xl:size-[180px]">
          <Image
            src={currentStreamerImageUrl}
            alt={currentStreamer.name}
            width={180}
            height={180}
            className="size-full object-cover object-center"
            priority
          />
        </div>

        <div className="min-w-0 self-start pt-0.5">
          <StatusChip tone="active" className="mb-2 h-7 px-3">
            {getAuctionPhaseLabel(currentPhase)}
          </StatusChip>
          <p className="text-sm font-bold text-violet-500">
            {getAuctionLineLabel(currentStreamer.line)}
          </p>
          <h2 className="mt-1 truncate text-2xl font-black tracking-[-0.03em] text-text-primary">
            {currentStreamer.name}
          </h2>
          <p className="mt-1 text-sm leading-5 font-semibold text-text-secondary">
            {createAuctionTurnAnnouncement(currentStreamer)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-violet-100 bg-white/82 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <TimerIcon className="size-4 text-violet-500" />
                <p className="text-xs font-bold whitespace-nowrap text-text-secondary">남은 시간</p>
              </div>
              <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-violet-700">
                {remainSeconds.toString().padStart(2, "0")}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-white/82 px-3 py-2.5">
              <p className="text-xs font-bold whitespace-nowrap text-text-secondary">현재 최고가</p>
              <p className="mt-1 text-xl font-black tracking-[-0.03em] text-text-primary">
                {currentHighestBidAmount}P
              </p>
              <Badge tone="brand" variant="soft" size="md" className="mt-1.5">
                {currentHighestBidTeamName}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

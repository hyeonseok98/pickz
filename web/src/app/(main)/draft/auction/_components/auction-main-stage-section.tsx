import { Badge, SectionCard, StatusChip } from "@/components/common/ui";
import type { AuctionPhase, AuctionStreamer } from "@/types/draft/auction";
import { getAuctionLineLabel } from "@/utils/draft/auction";
import Image from "next/image";

interface AuctionMainStageSectionProps {
  currentHighestBidAmount: number;
  currentHighestBidTeamName: string | null;
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
}: AuctionMainStageSectionProps) {
  const currentStreamerImageUrl = currentStreamer.profileImageUrl ?? "/streamer_profile/hejin.webp";

  return (
    <SectionCard
      padding="sm"
      className="relative min-h-80 overflow-hidden border-violet-100/80 bg-white/90 text-text-primary shadow-surface-lg xl:h-full xl:min-h-0"
      contentClassName="mt-0 h-full"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(124,58,237,0.18),transparent_36%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="relative grid h-full min-h-0 grid-cols-1 items-center gap-5 p-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-5 xl:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="mx-auto aspect-square w-45 self-center overflow-hidden rounded-3xl bg-violet-100/70 shadow-surface-sm sm:mx-0 sm:w-44 xl:w-48">
          <Image
            src={currentStreamerImageUrl}
            alt={currentStreamer.name}
            width={192}
            height={192}
            className="size-full object-cover object-center"
            priority
          />
        </div>

        <div className="min-w-0 self-center">
          <StatusChip tone="active" className="mb-3 h-7 px-3">
            {getAuctionPhaseLabel(currentPhase)}
          </StatusChip>
          <p className="text-sm font-bold text-violet-500">
            {getAuctionLineLabel(currentStreamer.line)}
          </p>
          <h2 className="mt-1 truncate text-2xl font-black tracking-[-0.03em] text-text-primary">
            {currentStreamer.name}
          </h2>
          <div className="mt-4">
            <div className="min-h-24 rounded-2xl border border-violet-100 bg-white/82 px-4 py-4">
              <p className="text-xs font-bold whitespace-nowrap text-text-secondary">현재 최고가</p>
              <div className="mt-2.5 flex items-end gap-2">
                <p className="text-[34px] leading-none font-black tracking-[-0.03em] text-text-primary">
                  {currentHighestBidAmount}
                </p>
                <span className="pb-1 text-base font-black text-text-secondary">포인트</span>
                <Badge
                  tone={currentHighestBidTeamName ? "brand" : "neutral"}
                  variant="soft"
                  size="md"
                >
                  {currentHighestBidTeamName ?? "입찰 없음"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

import { Badge, SectionCard, StatusChip } from "@/components/common/ui";
import type { AuctionPhase, AuctionStreamer } from "@/types/draft/auction";
import { cn } from "@/utils";
import { getAuctionLineLabel } from "@/utils/draft/auction";
import Image from "next/image";

interface AuctionMainStageSectionProps {
  currentHighestBidAmount: number;
  currentHighestBidTeamName: string | null;
  currentPhase: AuctionPhase;
  currentStreamer: AuctionStreamer | null;
}

const phaseLabelMap: Record<AuctionPhase, string> = {
  BIDDING: "경매 진행",
  COUNTDOWN: "다음 순서",
  EVALUATING: "결과 확인",
  FINISHED: "종료",
  ROUND_RESULT: "라운드 결과",
  STANDBY: "대기",
};

export function getAuctionPhaseLabel(phase: AuctionPhase) {
  return phaseLabelMap[phase];
}

function getAuctionLineClassName(line: AuctionStreamer["line"] | null) {
  switch (line) {
    case "top":
      return "text-amber-600";
    case "jungle":
      return "text-emerald-600";
    case "mid":
      return "text-sky-600";
    case "adc":
      return "text-fuchsia-600";
    case "support":
      return "text-cyan-600";
    default:
      return "text-violet-500";
  }
}

export function AuctionMainStageSection({
  currentHighestBidAmount,
  currentHighestBidTeamName,
  currentPhase,
  currentStreamer,
}: AuctionMainStageSectionProps) {
  const currentStreamerImageUrl = currentStreamer?.profileImageUrl ?? null;
  const currentStreamerLineLabel = currentStreamer ? getAuctionLineLabel(currentStreamer.line) : "대기";
  const currentStreamerName = currentStreamer?.name ?? "경매 준비중...";

  return (
    <SectionCard
      padding="sm"
      className="relative min-h-80 overflow-hidden border-violet-100/80 bg-white/90 text-text-primary shadow-surface-lg xl:h-full xl:min-h-0"
      contentClassName="mt-0 h-full"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(124,58,237,0.18),transparent_36%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="relative grid h-full min-h-0 grid-cols-1 items-center gap-5 p-2 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="mx-auto aspect-square w-52 self-center overflow-hidden rounded-3xl bg-violet-100/70 shadow-surface-sm sm:mx-0 xl:w-56">
          {currentStreamerImageUrl ? (
            <Image
              src={currentStreamerImageUrl}
              alt={currentStreamerName}
              width={192}
              height={192}
              className="size-full object-cover object-center"
              priority
            />
          ) : null}
        </div>

        <div className="grid min-w-0 self-stretch py-1 sm:content-center">
          <StatusChip tone="active" className="mb-3 h-7 w-fit justify-self-start px-3">
            {getAuctionPhaseLabel(currentPhase)}
          </StatusChip>
          <p
            className={cn(
              "text-sm font-bold",
              getAuctionLineClassName(currentStreamer?.line ?? null),
            )}
          >
            {currentStreamerLineLabel}
          </p>
          <h2 className="mt-1 truncate text-2xl font-black tracking-[-0.03em] text-text-primary">
            {currentStreamerName}
          </h2>
          <div className="mt-4">
            <div className="min-h-24 rounded-2xl border border-violet-100 bg-white/82 px-4 py-4">
              <p className="text-xs font-bold whitespace-nowrap text-text-secondary">현재 최고가</p>
              <div className="mt-2.5 flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
                <div className="flex min-w-0 shrink-0 items-end gap-1 whitespace-nowrap">
                  <p className="text-[34px] leading-none font-black tracking-[-0.03em] text-text-primary">
                    {currentHighestBidAmount}
                  </p>
                  <span className="pb-1 text-base font-black text-text-secondary">포인트</span>
                </div>
                <Badge
                  tone={currentHighestBidTeamName ? "brand" : "neutral"}
                  variant="soft"
                  size="md"
                  className="max-w-full truncate"
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

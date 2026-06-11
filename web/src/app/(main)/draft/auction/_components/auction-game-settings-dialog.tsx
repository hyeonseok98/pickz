"use client";

import { Button, SectionCard } from "@/components/common/ui";
import { cn } from "@/utils";

interface AuctionGameSettingsDialogProps {
  biddingSeconds: string;
  isUntimedAuction: boolean;
  onBiddingSecondsChange: (seconds: string) => void;
  onClose: () => void;
  onStandbySecondsChange: (seconds: string) => void;
  onUntimedAuctionChange: (isUntimedAuction: boolean) => void;
  standbySeconds: string;
}

function getNumericInputValue(value: string) {
  return value.replace(/\D/g, "");
}

export function AuctionGameSettingsDialog({
  biddingSeconds,
  isUntimedAuction,
  onBiddingSecondsChange,
  onClose,
  onStandbySecondsChange,
  onUntimedAuctionChange,
  standbySeconds,
}: AuctionGameSettingsDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-6">
      <SectionCard
        padding="md"
        className="w-full max-w-xl border-violet-100 bg-white"
        title="게임 설정"
        headerEnd={
          <Button type="button" size="sm" onClick={onClose}>
            확인
          </Button>
        }
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-violet-50 p-1">
            <button
              type="button"
              className={cn(
                "h-10 cursor-pointer rounded-xl text-sm font-bold transition-colors",
                !isUntimedAuction
                  ? "bg-white text-violet-700 shadow-surface-sm"
                  : "text-text-secondary",
              )}
              onClick={() => {
                onUntimedAuctionChange(false);
              }}
            >
              시간제한 있음
            </button>
            <button
              type="button"
              className={cn(
                "h-10 cursor-pointer rounded-xl text-sm font-bold transition-colors",
                isUntimedAuction
                  ? "bg-white text-violet-700 shadow-surface-sm"
                  : "text-text-secondary",
              )}
              onClick={() => {
                onUntimedAuctionChange(true);
              }}
            >
              시간제한 없음
            </button>
          </div>

          {!isUntimedAuction ? (
            <div className="grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-text-primary">게임 시작 전 대기시간</span>
                <span className="text-xs font-semibold text-text-secondary">
                  게임 시작 버튼을 누른 뒤 첫 경매가 열리기 전까지 기다리는 시간입니다.
                </span>
                <div className="grid h-11 grid-cols-[minmax(0,1fr)_2.5rem] items-center rounded-2xl border border-violet-100 px-4">
                  <input
                    inputMode="numeric"
                    value={standbySeconds}
                    onChange={(event) => {
                      onStandbySecondsChange(getNumericInputValue(event.target.value));
                    }}
                    className="min-w-0 bg-transparent text-sm font-semibold text-text-primary outline-none"
                  />
                  <span className="text-right text-sm font-bold text-text-secondary">초</span>
                </div>
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-text-primary">경매 시간</span>
                <span className="text-xs font-semibold text-text-secondary">
                  각 선수 경매가 시작된 뒤 입찰을 받을 수 있는 제한 시간입니다.
                </span>
                <div className="grid h-11 grid-cols-[minmax(0,1fr)_2.5rem] items-center rounded-2xl border border-violet-100 px-4">
                  <input
                    inputMode="numeric"
                    value={biddingSeconds}
                    onChange={(event) => {
                      onBiddingSecondsChange(getNumericInputValue(event.target.value));
                    }}
                    className="min-w-0 bg-transparent text-sm font-semibold text-text-primary outline-none"
                  />
                  <span className="text-right text-sm font-bold text-text-secondary">초</span>
                </div>
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-4 text-sm font-semibold text-text-secondary">
              시간 제한 없이 직접 입찰, 낙찰, 유찰을 진행합니다.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

"use client";

import { Button, SectionCard } from "@/components/common/ui";
import { auctionBidIncrementOptions } from "@/constants/draft";
import { getAuctionBidAmountAfterIncrement, validateAuctionBidAmount } from "@/utils/draft/auction";
import { useEffect, useState } from "react";
import { GavelLineIcon } from "./auction-icons";

interface AuctionBidControlPanelProps {
  currentHighestBidAmount: number;
  isBidDisabled?: boolean;
  onSubmitBid?: (bidAmount: number) => void;
  remainSeconds: number;
  remainingPoints: number;
}

export function AuctionBidControlPanel({
  currentHighestBidAmount,
  isBidDisabled = false,
  onSubmitBid,
  remainSeconds,
  remainingPoints,
}: AuctionBidControlPanelProps) {
  const minimumBidAmount = currentHighestBidAmount + 5;
  const [bidInputValue, setBidInputValue] = useState(String(minimumBidAmount));
  const bidAmount = Number(bidInputValue);
  const validation = validateAuctionBidAmount({
    amount: Number.isFinite(bidAmount) ? bidAmount : 0,
    currentHighestBidAmount,
    remainingPoints,
  });

  useEffect(() => {
    setBidInputValue(String(minimumBidAmount));
  }, [minimumBidAmount]);

  const updateBidInputByIncrement = (incrementAmount: number) => {
    const currentAmount = Number.isFinite(bidAmount) ? bidAmount : currentHighestBidAmount;
    setBidInputValue(String(getAuctionBidAmountAfterIncrement(currentAmount, incrementAmount)));
  };

  const submitBid = () => {
    if (isBidDisabled || !validation.isValid) {
      return;
    }

    onSubmitBid?.(bidAmount);
  };

  return (
    <SectionCard
      padding="sm"
      className="min-h-44 border-violet-100/80 bg-white/90 xl:h-full xl:min-h-0"
      contentClassName="h-full"
    >
      <div className="grid h-full gap-3 md:grid-cols-[minmax(0,1fr)_120px] md:items-center">
        <div className="grid min-w-0 gap-1.5">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {auctionBidIncrementOptions.map((amount) => (
              <Button
                key={amount}
                type="button"
                size="sm"
                variant="secondary"
                disabled={isBidDisabled}
                onClick={() => {
                  updateBidInputByIncrement(amount);
                }}
              >
                +{amount}
              </Button>
            ))}
          </div>

          <label className="block">
            <div className="grid h-16 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center rounded-2xl border border-violet-100 bg-white shadow-surface-sm md:h-14">
              <button
                type="button"
                className="flex size-9 cursor-pointer items-center justify-center justify-self-center rounded-xl bg-violet-50 text-xl font-black text-violet-700"
                disabled={isBidDisabled}
                onClick={() => {
                  updateBidInputByIncrement(-5);
                }}
                aria-label="입찰 금액 감소"
              >
                -
              </button>
              <div className="flex min-w-0 items-center justify-center">
                <input
                  inputMode="numeric"
                  value={bidInputValue}
                  onChange={(event) => {
                    setBidInputValue(event.target.value.replace(/\D/g, ""));
                  }}
                  className="w-20 min-w-0 bg-transparent text-center text-3xl font-black tracking-[-0.03em] text-text-primary outline-none sm:w-24"
                  aria-label="입찰 금액"
                  disabled={isBidDisabled}
                />
                <span className="text-sm font-bold whitespace-nowrap text-text-secondary">P</span>
              </div>
              <button
                type="button"
                className="flex size-9 cursor-pointer items-center justify-center justify-self-center rounded-xl bg-violet-600 text-xl font-black text-white"
                disabled={isBidDisabled}
                onClick={() => {
                  updateBidInputByIncrement(5);
                }}
                aria-label="입찰 금액 증가"
              >
                +
              </button>
            </div>
          </label>

          <p className="truncate text-xs font-semibold text-text-secondary">
            {validation.message ?? `다음 최소 입찰가 ${minimumBidAmount}P`}
          </p>
        </div>

        <div className="grid gap-2 border-t border-violet-100 pt-3 md:h-full md:content-center md:border-t-0 md:border-l md:pt-0 md:pl-3">
          <div className="text-center md:text-center">
            <p className="text-xs font-bold whitespace-nowrap text-text-muted">남은 시간</p>
            <p className="mt-1 text-2xl font-black text-violet-700">
              {remainSeconds.toString().padStart(2, "0")}
            </p>
          </div>
          <Button
            disabled={isBidDisabled || !validation.isValid}
            size="md"
            className="h-11 w-full px-2 text-sm"
            leadingIcon={<GavelLineIcon className="size-full" />}
            onClick={submitBid}
          >
            입찰하기
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

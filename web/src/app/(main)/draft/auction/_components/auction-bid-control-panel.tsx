"use client";

import { useState } from "react";
import { Button, SectionCard } from "@/components/common/ui";
import { auctionBidIncrementOptions } from "@/constants/draft";
import {
  getAuctionBidAmountAfterIncrement,
  validateAuctionBidAmount,
} from "@/utils/draft/auction";
import { CoinIcon, GavelLineIcon } from "./auction-icons";

interface AuctionBidControlPanelProps {
  currentHighestBidAmount: number;
  remainSeconds: number;
  remainingPoints: number;
}

export function AuctionBidControlPanel({
  currentHighestBidAmount,
  remainSeconds,
  remainingPoints,
}: AuctionBidControlPanelProps) {
  const [bidInputValue, setBidInputValue] = useState(
    String(currentHighestBidAmount + 5),
  );
  const bidAmount = Number(bidInputValue);
  const validation = validateAuctionBidAmount({
    amount: Number.isFinite(bidAmount) ? bidAmount : 0,
    currentHighestBidAmount,
    remainingPoints,
  });

  const updateBidInputByIncrement = (incrementAmount: number) => {
    const currentAmount = Number.isFinite(bidAmount)
      ? bidAmount
      : currentHighestBidAmount;
    setBidInputValue(
      String(getAuctionBidAmountAfterIncrement(currentAmount, incrementAmount)),
    );
  };

  return (
    <SectionCard
      padding="sm"
      className="min-h-[150px] border-violet-100/80 bg-white/90 xl:h-full xl:min-h-0"
      contentClassName="h-full"
    >
      <div className="grid h-full gap-3 sm:grid-cols-[minmax(0,1fr)_116px] sm:items-center">
        <div className="grid min-w-0 gap-1.5">
          <div className="grid grid-cols-4 gap-1.5">
            {auctionBidIncrementOptions.map((amount) => (
              <Button
                key={amount}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  updateBidInputByIncrement(amount);
                }}
              >
                +{amount}
              </Button>
            ))}
          </div>

          <label className="block">
            <div className="grid h-14 grid-cols-[40px_minmax(0,1fr)_40px] items-center rounded-2xl border border-violet-100 bg-white shadow-surface-sm">
              <button
                type="button"
                className="flex size-9 cursor-pointer items-center justify-center justify-self-center rounded-xl bg-violet-50 text-xl font-black text-violet-700"
                onClick={() => {
                  updateBidInputByIncrement(-5);
                }}
                aria-label="입찰 금액 감소"
              >
                -
              </button>
              <div className="flex min-w-0 items-center justify-center">
                <CoinIcon className="mr-2 size-5 shrink-0 text-violet-600" />
                <input
                  inputMode="numeric"
                  value={bidInputValue}
                  onChange={(event) => {
                    setBidInputValue(event.target.value.replace(/\D/g, ""));
                  }}
                  className="min-w-0 max-w-[120px] bg-transparent text-center text-[28px] font-black tracking-[-0.03em] text-text-primary outline-none"
                  aria-label="입찰 금액"
                />
                <span className="whitespace-nowrap text-sm font-bold text-text-secondary">P</span>
              </div>
              <button
                type="button"
                className="flex size-9 cursor-pointer items-center justify-center justify-self-center rounded-xl bg-violet-600 text-xl font-black text-white"
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
            {validation.message ??
              `다음 최소 입찰가 ${currentHighestBidAmount + 5}P`}
          </p>
        </div>

        <div className="grid h-full content-center gap-2 border-l border-violet-100 pl-3">
          <div className="text-center">
            <p className="text-xs font-bold whitespace-nowrap text-text-muted">남은 시간</p>
            <p className="mt-1 text-2xl font-black text-violet-700">
              {remainSeconds.toString().padStart(2, "0")}
            </p>
          </div>
          <Button
            disabled={!validation.isValid}
            size="md"
            className="h-10 px-2 text-[13px]"
            leadingIcon={<GavelLineIcon className="size-full" />}
          >
            입찰하기
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

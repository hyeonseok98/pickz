import { auctionBidUnit, auctionMinimumBidAmount } from "@/constants/draft";
import type { AuctionBidValidationParams, AuctionBidValidationResult } from "@/types/draft/auction";

/** 입력한 금액이 경매 입찰 단위를 지키는지 확인 */
export function isAuctionBidUnitAmount(amount: number) {
  return Number.isInteger(amount) && amount % auctionBidUnit === 0;
}

/** 현재 입력 금액에 빠른 입찰 증가값을 더함 */
export function getAuctionBidAmountAfterIncrement(currentAmount: number, incrementAmount: number) {
  return currentAmount + incrementAmount;
}

/** 입찰 금액이 서버 전송 가능한 값인지 확인 */
export function validateAuctionBidAmount({
  amount,
  currentHighestBidAmount,
  remainingPoints,
}: AuctionBidValidationParams): AuctionBidValidationResult {
  if (amount < auctionMinimumBidAmount) {
    return {
      isValid: false,
      message: `${auctionMinimumBidAmount}포인트 이상부터 입찰할 수 있습니다`,
    };
  }

  if (!isAuctionBidUnitAmount(amount)) {
    return {
      isValid: false,
      message: `${auctionBidUnit}포인트 단위로 입찰할 수 있습니다`,
    };
  }

  if (amount <= currentHighestBidAmount) {
    return {
      isValid: false,
      message: "현재 최고 입찰가보다 높은 금액을 입력해 주세요",
    };
  }

  if (amount > remainingPoints) {
    return {
      isValid: false,
      message: "보유 포인트보다 높은 금액은 입찰할 수 없습니다",
    };
  }

  return {
    isValid: true,
    message: null,
  };
}

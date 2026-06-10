import type { AuctionStreamer } from "@/types/draft/auction";

/** 경매 대상 스트리머 목록을 원본 변경 없이 무작위 순서로 변환 */
export function shuffleAuctionStreamers(streamers: AuctionStreamer[]) {
  const shuffledStreamers = [...streamers];

  for (let index = shuffledStreamers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledStreamers[index], shuffledStreamers[randomIndex]] = [
      shuffledStreamers[randomIndex],
      shuffledStreamers[index],
    ];
  }

  return shuffledStreamers;
}

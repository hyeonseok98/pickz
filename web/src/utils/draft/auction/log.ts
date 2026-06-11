import type { AuctionChatMessage, AuctionChatMessageSegment, AuctionStreamer } from "@/types/draft";
import { createAuctionTurnAnnouncement } from "./round";
import { createAuctionLogTime } from "./game-flow";

interface AuctionLogPayload {
  message: string;
  segments?: AuctionChatMessageSegment[];
  type?: AuctionChatMessage["type"];
}

const auctionLineLogLabelMap: Record<AuctionStreamer["line"], string> = {
  adc: "원딜",
  jungle: "정글",
  mid: "미드",
  support: "서폿",
  top: "탑",
};

function createAuctionLogEntry({
  message,
  segments,
  type = "system",
}: AuctionLogPayload): AuctionChatMessage {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    message,
    segments,
    sentAt: createAuctionLogTime(),
    type,
  };
}

function getLineTone(line: AuctionStreamer["line"]): AuctionChatMessageSegment["tone"] {
  switch (line) {
    case "top":
      return "lineTop";
    case "jungle":
      return "lineJungle";
    case "mid":
      return "lineMid";
    case "adc":
      return "lineAdc";
    case "support":
      return "lineSupport";
  }
}

function getTeamTone(teamId: number): AuctionChatMessageSegment["tone"] {
  switch (teamId) {
    case 1:
      return "teamOne";
    case 2:
      return "teamTwo";
    case 3:
      return "teamThree";
    case 4:
      return "teamFour";
    default:
      return "teamFive";
  }
}

/** 선수 경매 차례 안내 로그 생성 */
export function createTurnAnnouncementLog(streamer: AuctionStreamer) {
  return createAuctionLogEntry({
    message: createAuctionTurnAnnouncement(streamer),
    segments: [
      { text: auctionLineLogLabelMap[streamer.line], tone: getLineTone(streamer.line) },
      { text: "-" },
      { text: streamer.name, tone: "primary" },
      { text: " 경매 차례입니다." },
    ],
  });
}

/** 카운트다운 로그 생성 */
export function createCountdownLog(seconds: number) {
  return createAuctionLogEntry({
    message: `${seconds}, ${seconds - 1}, ${seconds - 2}`,
    segments: [{ text: `${seconds}`, tone: "warning" }, { text: "초 카운트다운" }],
  });
}

/** 입찰 시작 로그 생성 */
export function createBidStartLog() {
  return createAuctionLogEntry({
    message: "입찰 시작",
    segments: [{ text: "입찰", tone: "primary" }, { text: "이 시작되었습니다." }],
  });
}

/** 입찰 시도 로그 생성 */
export function createBidPlacedLog(
  teamId: number,
  teamName: string,
  streamerName: string,
  bidAmount: number,
) {
  return createAuctionLogEntry({
    message: `${teamName}-${streamerName}-${bidAmount}포인트`,
    segments: [
      { text: teamName, tone: getTeamTone(teamId) },
      { text: "-" },
      { text: streamerName },
      { text: "-" },
      { text: `${bidAmount}포인트`, tone: "warning" },
    ],
    type: "bid",
  });
}

/** 낙찰 로그 생성 */
export function createSoldLog(
  teamId: number,
  teamName: string,
  streamerName: string,
  bidAmount: number,
) {
  return createAuctionLogEntry({
    message: `${teamName}-${streamerName}-${bidAmount}포인트-낙찰`,
    segments: [
      { text: teamName, tone: getTeamTone(teamId) },
      { text: "-" },
      { text: streamerName },
      { text: "-" },
      { text: `${bidAmount}포인트`, tone: "warning" },
      { text: "-" },
      { text: "낙찰", tone: "success" },
    ],
    type: "bid",
  });
}

/** 자동 배정 로그 생성 */
export function createAutoAssignedLog(teamId: number, teamName: string, streamerName: string) {
  return createAuctionLogEntry({
    message: `${teamName}-${streamerName}-0포인트-배정`,
    segments: [
      { text: teamName, tone: getTeamTone(teamId) },
      { text: "-" },
      { text: streamerName },
      { text: "-" },
      { text: "0포인트", tone: "warning" },
      { text: "-" },
      { text: "배정", tone: "success" },
    ],
  });
}

/** 자동 배정 실패 로그 생성 */
export function createAutoAssignFailedLog(streamerName: string) {
  return createAuctionLogEntry({
    message: `${streamerName} 자동 배정 실패`,
    segments: [
      { text: streamerName, tone: "primary" },
      { text: " 선수를 배정할 빈 라인 슬롯이 없습니다.", tone: "danger" },
    ],
  });
}

/** 유찰 로그 생성 */
export function createUnbidLog(streamer: AuctionStreamer) {
  return createAuctionLogEntry({
    message: `${streamer.name} 유찰`,
    segments: [
      { text: streamer.name, tone: "primary" },
      { text: " 선수가 " },
      { text: "유찰", tone: "danger" },
      { text: "되었습니다." },
    ],
  });
}

/** 재경매 진입 로그 생성 */
export function createReauctionLog(round: number, streamer: AuctionStreamer) {
  return createAuctionLogEntry({
    message: `재경매 ${round}회차-${streamer.name}`,
    segments: [
      { text: `${round}차 재경매`, tone: "warning" },
      { text: ": " },
      { text: createAuctionTurnAnnouncement(streamer), tone: "muted" },
    ],
  });
}

/** 재경매 종료 후 자동 배정 안내 로그 생성 */
export function createReauctionAutoAssignNoticeLog() {
  return createAuctionLogEntry({
    message: "재경매 2회차 종료 후 남은 선수는 랜덤 배정됩니다",
    segments: [
      { text: "재경매 2회차", tone: "warning" },
      { text: "가 끝나면 남은 선수는 남은 팀에 " },
      { text: "랜덤 배정", tone: "success" },
      { text: "됩니다." },
    ],
  });
}

/** 다음 라운드 대기 로그 생성 */
export function createRoundWaitLog(waitSeconds: number) {
  return createAuctionLogEntry({
    message: `${waitSeconds}초 대기`,
    segments: [
      { text: "다음 경매까지 ", tone: "muted" },
      { text: `${waitSeconds}초`, tone: "warning" },
      { text: " 대기합니다.", tone: "muted" },
    ],
  });
}

/** 시간 제한 없는 경매 시작 로그 생성 */
export function createUntimedStartLog() {
  return createAuctionLogEntry({
    message: "시간 제한 없는 경매 시작",
    segments: [
      { text: "시간 제한 없는 경매", tone: "primary" },
      { text: "를 시작합니다." },
    ],
  });
}

/** 시간 제한 경매 시작 대기 로그 생성 */
export function createTimedStartLog(waitSeconds: number) {
  return createAuctionLogEntry({
    message: `${waitSeconds}초 뒤 시작`,
    segments: [
      { text: "게임 시작 전 ", tone: "muted" },
      { text: `${waitSeconds}초`, tone: "warning" },
      { text: " 대기합니다.", tone: "muted" },
    ],
  });
}

/** 경매 초기화 로그 생성 */
export function createResetLog() {
  return createAuctionLogEntry({
    message: "경매 대기중 상태로 돌아갔습니다",
    segments: [{ text: "경매 대기중 상태", tone: "primary" }, { text: "로 돌아갔습니다." }],
  });
}

/** 경매 종료 로그 생성 */
export function createAuctionFinishedLog() {
  return createAuctionLogEntry({
    message: "경매가 종료되었습니다",
    segments: [{ text: "경매", tone: "primary" }, { text: "가 종료되었습니다." }],
  });
}

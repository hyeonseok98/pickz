export type DraftRoomEventSuccessCode = "SUCCESS";

export type DraftRoomStatus = "WAITING" | "PLAYING";

export interface DraftRoomParticipantJoinedEventPayload {
  newParticipant: string;
  nicknames: string[];
  totalCount: number;
}

export interface DraftRoomParticipantJoinedEvent {
  payload: DraftRoomParticipantJoinedEventPayload;
  roomId: number;
}

export interface DraftRoomStartedEventPayload {
  redirectUrl: string;
  roomStatus: DraftRoomStatus;
}

export interface DraftRoomStartedEvent {
  code: DraftRoomEventSuccessCode;
  payload: DraftRoomStartedEventPayload;
}

export interface DraftRoomPickSucceededEventResult {
  code: DraftRoomEventSuccessCode;
  isDraftDone: boolean;
  nextTurnNickname: string | null;
  pickedNickname: string;
  pickedStreamerId: string;
  roomId: number;
}

export interface DraftRoomPickSucceededEvent {
  result: DraftRoomPickSucceededEventResult;
}

export interface DraftRoomChatMessageEvent {
  content: string;
  nickname: string;
  timestamp: string;
  type: "CHAT";
}

export interface DraftRoomErrorEvent {
  code: string;
  message: string;
}

export type DraftRoomEvent =
  | DraftRoomParticipantJoinedEvent
  | DraftRoomPickSucceededEvent
  | DraftRoomStartedEvent;

export type DraftRoomRawMessage = string;

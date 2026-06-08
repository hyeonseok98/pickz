export type DraftRoomEventSuccessCode = "SUCCESS";

export type DraftRoomStatus = "WAITING" | "PLAYING";

export interface DraftRoomParticipantsChangedEventPayload {
  newParticipant: string;
  nicknames: string[];
  totalCount: number;
}

export interface DraftRoomParticipantsChangedEvent {
  payload: DraftRoomParticipantsChangedEventPayload;
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

export interface DraftRoomDeletedEventPayload {
  message?: string;
  reason?: string;
}

export interface DraftRoomDeletedEvent {
  payload?: DraftRoomDeletedEventPayload;
  roomId: number;
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
  | DraftRoomDeletedEvent
  | DraftRoomPickSucceededEvent
  | DraftRoomParticipantsChangedEvent
  | DraftRoomStartedEvent;

export type DraftRoomRawMessage = string;

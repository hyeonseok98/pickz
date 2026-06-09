export interface DraftRoomParticipantTokenHeaderParams {
  participantToken: string;
}

export interface DraftRoomStompConnectHeaderParams extends DraftRoomParticipantTokenHeaderParams {
  roomId: number;
}

/** 참가자 토큰이 필요한 드래프트 API 요청 헤더 생성 */
export function createDraftParticipantTokenHeader({
  participantToken,
}: DraftRoomParticipantTokenHeaderParams) {
  return {
    "X-Participant-Token": participantToken,
  };
}

/** STOMP CONNECT에서 방과 참가자를 식별하기 위한 헤더 생성 */
export function createDraftRoomStompConnectHeaders({
  participantToken,
  roomId,
}: DraftRoomStompConnectHeaderParams) {
  return {
    ...createDraftParticipantTokenHeader({ participantToken }),
    roomId: String(roomId),
  };
}

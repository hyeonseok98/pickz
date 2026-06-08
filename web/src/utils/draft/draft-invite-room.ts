import type {
  CreateDraftRoomRequest,
  DraftInviteParticipantItem,
  DraftParticipantEventPayload,
  DraftType,
  JoinDraftRoomResponse,
  ParticipationMode,
} from "@/types/draft";

interface CreateDraftInviteLinkParams {
  baseUrl: string;
  coachEnabled?: boolean;
  draftType: DraftType;
  headCoachEnabled?: boolean;
  inviteCode: string;
  teamCount: string;
  teamSize: string;
}

interface CreateDraftRoomCreateRequestParams {
  draftType: DraftType;
  mode: ParticipationMode;
  roomTitle: string;
  teamCount: string;
  teamSize: string;
  tournamentId: string;
}

interface DraftStartRedirectEvent {
  redirectUrl: string;
}

interface CreateNicknamesFromParticipantEventParams {
  currentParticipants: DraftInviteParticipantItem[];
  eventPayload: DraftParticipantEventPayload;
}

interface PadParticipantNicknamesParams {
  fallbackHostName: string;
  nicknames: string[];
  totalCount: number;
}

interface GetParticipantStatusParams {
  fallbackHostName: string;
  matchedParticipant?: DraftInviteParticipantItem;
  nickname: string;
  participantIndex: number;
}

interface MergeDraftInviteParticipantListParams {
  currentParticipants: DraftInviteParticipantItem[];
  eventPayload: DraftParticipantEventPayload;
  fallbackHostName: string;
}

/** 초대 코드와 방 설정으로 참가자가 열 수 있는 공유 링크 생성 */
export function createDraftInviteLink({
  baseUrl,
  coachEnabled,
  draftType,
  headCoachEnabled,
  inviteCode,
  teamCount,
  teamSize,
}: CreateDraftInviteLinkParams) {
  const searchParams = new URLSearchParams({
    draftType,
    mode: "party",
    teamCount,
    teamSize,
  });

  if (headCoachEnabled) {
    searchParams.set("headCoachEnabled", "true");
  }

  if (coachEnabled) {
    searchParams.set("coachEnabled", "true");
  }

  return `${baseUrl}/join/${inviteCode}?${searchParams.toString()}`;
}

/** 방 설정 화면 값을 방 생성 API 요청 body로 변환 */
export function createDraftRoomCreateRequest({
  draftType,
  mode,
  roomTitle,
  teamCount,
  teamSize,
  tournamentId,
}: CreateDraftRoomCreateRequestParams): CreateDraftRoomRequest {
  return {
    draftMode: draftType === "auction" ? "AUCTION" : "SNAKE",
    participationType: mode === "party" ? "TOGETHER" : "SOLO",
    preset: tournamentId,
    teamCount: Number(teamCount),
    teamSize: Number(teamSize),
    title: roomTitle.trim() || "Pickz 드래프트 방",
  };
}

/** 비어 있거나 null 문자열인 닉네임을 화면 기본 이름으로 대체 */
export function getDraftInviteDisplayNickname(
  nickname: string | undefined,
  fallbackLabel: string,
) {
  const normalizedNickname = nickname?.trim();

  if (!normalizedNickname || normalizedNickname === "null") {
    return fallbackLabel;
  }

  return normalizedNickname;
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseJsonRecord(messageBody: string) {
  const parsedValue = JSON.parse(messageBody) as unknown;

  return isRecordValue(parsedValue) ? parsedValue : null;
}

function readEventPayload(parsedMessage: Record<string, unknown>) {
  return isRecordValue(parsedMessage.payload) ? parsedMessage.payload : parsedMessage;
}

function normalizeParticipantNickname(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const nickname = value.trim();

  return nickname.length > 0 && nickname !== "null" ? nickname : null;
}

function readParticipantNicknames(eventPayload: Record<string, unknown>) {
  if (!Array.isArray(eventPayload.nicknames)) {
    return [];
  }

  return eventPayload.nicknames
    .map(normalizeParticipantNickname)
    .filter((nickname): nickname is string => Boolean(nickname));
}

function readNewParticipantNickname(eventPayload: Record<string, unknown>) {
  return normalizeParticipantNickname(eventPayload.newParticipant) ?? undefined;
}

function readParticipantTotalCount(
  eventPayload: Record<string, unknown>,
  fallbackCount: number,
) {
  return typeof eventPayload.totalCount === "number" ? eventPayload.totalCount : fallbackCount;
}

function hasParticipantEventContent({
  newParticipant,
  nicknames,
  totalCount,
}: DraftParticipantEventPayload) {
  return nicknames.length > 0 || totalCount > 0 || Boolean(newParticipant);
}

/** sessionStorage의 참가 응답이 현재 참가 API 응답 형식인지 확인 */
export function isJoinDraftRoomResponseValue(
  value: unknown,
): value is JoinDraftRoomResponse {
  return (
    isRecordValue(value) &&
    typeof value.isHost === "boolean" &&
    typeof value.participantToken === "string" &&
    typeof value.roomId === "number"
  );
}

/** 참가자 변경 WebSocket 메시지에서 참가자 수와 닉네임 목록 추출 */
export function parseDraftParticipantEvent(
  messageBody: string,
): DraftParticipantEventPayload | null {
  try {
    const parsedMessage = parseJsonRecord(messageBody);

    if (!parsedMessage) {
      return null;
    }

    const eventPayload = readEventPayload(parsedMessage);
    const nicknames = readParticipantNicknames(eventPayload);
    const event = {
      newParticipant: readNewParticipantNickname(eventPayload),
      nicknames,
      totalCount: readParticipantTotalCount(eventPayload, nicknames.length),
    };

    return hasParticipantEventContent(event) ? event : null;
  } catch {
    return null;
  }
}

/** 게임 시작 WebSocket 메시지에서 이동할 화면 경로 추출 */
export function parseDraftStartEvent(messageBody: string): DraftStartRedirectEvent | null {
  try {
    const parsedMessage = parseJsonRecord(messageBody);

    if (
      !parsedMessage ||
      parsedMessage.code !== "SUCCESS" ||
      !isRecordValue(parsedMessage.payload)
    ) {
      return null;
    }

    return typeof parsedMessage.payload.redirectUrl === "string"
      ? { redirectUrl: parsedMessage.payload.redirectUrl }
      : null;
  } catch {
    return null;
  }
}

function getCurrentParticipantNicknames(participants: DraftInviteParticipantItem[]) {
  return participants.map((participant) => participant.nickname);
}

function createNicknamesFromParticipantEvent({
  currentParticipants,
  eventPayload,
}: CreateNicknamesFromParticipantEventParams) {
  if (eventPayload.nicknames.length > 0) {
    return eventPayload.nicknames;
  }

  const currentNicknames = getCurrentParticipantNicknames(currentParticipants);

  return eventPayload.newParticipant
    ? [...currentNicknames, eventPayload.newParticipant]
    : currentNicknames;
}

function padParticipantNicknames({
  fallbackHostName,
  nicknames,
  totalCount,
}: PadParticipantNicknamesParams) {
  return Array.from({ length: totalCount }, (_, index) => {
    const nickname = nicknames[index];

    if (nickname) {
      return nickname;
    }

    return index === 0 ? fallbackHostName : `참가자 ${index}`;
  });
}

function getParticipantStatus({
  fallbackHostName,
  matchedParticipant,
  nickname,
  participantIndex,
}: GetParticipantStatusParams) {
  if (participantIndex === 0 && nickname === fallbackHostName) {
    return "방장";
  }

  return matchedParticipant?.status ?? "새로 입장";
}

function mergeParticipantItem({
  fallbackHostName,
  matchedParticipant,
  nickname,
  participantIndex,
}: GetParticipantStatusParams): DraftInviteParticipantItem {
  return {
    id: matchedParticipant?.id ?? `${participantIndex}-${nickname}`,
    isHost: matchedParticipant?.isHost ?? participantIndex === 0,
    nickname,
    status: getParticipantStatus({
      fallbackHostName,
      matchedParticipant,
      nickname,
      participantIndex,
    }),
  };
}

/** 참가자 변경 내용을 현재 대기실 목록에 반영 */
export function mergeDraftInviteParticipantList({
  currentParticipants,
  eventPayload,
  fallbackHostName,
}: MergeDraftInviteParticipantListParams) {
  const eventNicknames = createNicknamesFromParticipantEvent({
    currentParticipants,
    eventPayload,
  });
  const participantCount = Math.max(eventPayload.totalCount, eventNicknames.length, 1);
  const paddedNicknames = padParticipantNicknames({
    fallbackHostName,
    nicknames: eventNicknames,
    totalCount: participantCount,
  });

  return paddedNicknames.map((nickname, participantIndex) => {
    const matchedParticipant = currentParticipants.find(
      (participant) => participant.nickname === nickname,
    );

    return mergeParticipantItem({
      fallbackHostName,
      matchedParticipant,
      nickname,
      participantIndex,
    });
  });
}

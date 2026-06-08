import type {
  CreateDraftRoomRequest,
  DraftInviteParticipantItem,
  DraftInviteRoleSlot,
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
  roleSlots?: DraftInviteRoleSlot[];
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

function createDraftRoomApiTeamSize(teamSize: string) {
  return Math.min(Number(teamSize), 5);
}

/** 고정된 감독 순서를 링크 query 문자열로 직렬화 */
export function serializeDraftInviteRoleOrder(roleSlots: DraftInviteRoleSlot[]) {
  return JSON.stringify(roleSlots.map((roleSlot) => roleSlot.coachName));
}

/** 초대 링크 query의 감독 순서 문자열을 이름 목록으로 복원 */
export function parseDraftInviteRoleOrder(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (roleName): roleName is string =>
        typeof roleName === "string" && roleName.trim().length > 0,
    );
  } catch {
    return [];
  }
}

/** 초대 코드와 방 설정으로 참가자가 열 수 있는 공유 링크 생성 */
export function createDraftInviteLink({
  baseUrl,
  coachEnabled,
  draftType,
  headCoachEnabled,
  inviteCode,
  roleSlots,
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

  if (roleSlots && roleSlots.length > 0) {
    searchParams.set("roleOrder", serializeDraftInviteRoleOrder(roleSlots));
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
    teamSize: createDraftRoomApiTeamSize(teamSize),
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

function readParticipantReady(value: Record<string, unknown>) {
  return typeof value.isReady === "boolean" ? value.isReady : undefined;
}

function readParticipantTurnOrder(value: Record<string, unknown>) {
  return typeof value.turnOrder === "number" ? value.turnOrder : undefined;
}

function readParticipantSelectedCoachName(value: Record<string, unknown>) {
  return normalizeParticipantNickname(value.selectedCoachName) ?? undefined;
}

function createFallbackParticipantNickname(
  value: Record<string, unknown>,
  participantIndex: number,
) {
  const isHost = typeof value.isHost === "boolean" ? value.isHost : participantIndex === 0;

  if (isHost) {
    return "방장";
  }

  return `참가자 ${participantIndex}`;
}

function createParticipantItemFromRecord(
  value: Record<string, unknown>,
  participantIndex: number,
): DraftInviteParticipantItem | null {
  const participantId =
    typeof value.participantToken === "string"
      ? value.participantToken
      : typeof value.id === "number"
        ? String(value.id)
        : null;

  if (!participantId) {
    return null;
  }

  const nickname =
    normalizeParticipantNickname(value.nickname ?? value.nickName) ??
    createFallbackParticipantNickname(value, participantIndex);
  const isReady = readParticipantReady(value);

  return {
    id: participantId,
    isHost: typeof value.isHost === "boolean" ? value.isHost : participantIndex === 0,
    isReady,
    nickname,
    selectedCoachName: readParticipantSelectedCoachName(value),
    status: isReady ? "선택 완료" : "입장 완료",
    turnOrder: readParticipantTurnOrder(value),
  };
}

function readParticipantItems(eventPayload: Record<string, unknown>) {
  if (Array.isArray(eventPayload.participants)) {
    return eventPayload.participants
      .map((value, index) =>
        isRecordValue(value) ? createParticipantItemFromRecord(value, index) : null,
      )
      .filter((participant): participant is DraftInviteParticipantItem => Boolean(participant));
  }

  const participant = createParticipantItemFromRecord(eventPayload, 0);

  return participant ? [participant] : [];
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
  participants,
  totalCount,
}: DraftParticipantEventPayload) {
  return participants.length > 0 || nicknames.length > 0 || totalCount > 0 || Boolean(newParticipant);
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
    const participants = readParticipantItems(eventPayload);
    const nicknames = readParticipantNicknames(eventPayload);
    const fallbackCount = Math.max(nicknames.length, participants.length);
    const event = {
      newParticipant: readNewParticipantNickname(eventPayload),
      nicknames: nicknames.length > 0 ? nicknames : participants.map((participant) => participant.nickname),
      participants,
      totalCount: readParticipantTotalCount(eventPayload, fallbackCount),
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

    if (!parsedMessage || parsedMessage.code !== "SUCCESS") {
      return null;
    }

    const payload = isRecordValue(parsedMessage.payload) ? parsedMessage.payload : parsedMessage;

    return typeof payload.redirectUrl === "string" ? { redirectUrl: payload.redirectUrl } : null;
  } catch {
    return null;
  }
}

function getCurrentParticipantNicknames(participants: DraftInviteParticipantItem[]) {
  return participants.map((participant) => participant.nickname);
}

function mergeParticipantItemsFromEvent(
  currentParticipants: DraftInviteParticipantItem[],
  eventParticipants: DraftInviteParticipantItem[],
) {
  return eventParticipants.map((eventParticipant) => {
    const currentParticipant = currentParticipants.find(
      (participant) => participant.id === eventParticipant.id,
    );

    return currentParticipant
      ? {
          ...currentParticipant,
          ...eventParticipant,
        }
      : eventParticipant;
  });
}

function createNicknamesFromParticipantEvent({
  currentParticipants,
  eventPayload,
}: CreateNicknamesFromParticipantEventParams) {
  if (eventPayload.participants.length > 0) {
    return eventPayload.participants.map((participant) => participant.nickname);
  }

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
    isReady: matchedParticipant?.isReady,
    nickname,
    selectedCoachName: matchedParticipant?.selectedCoachName,
    status: getParticipantStatus({
      fallbackHostName,
      matchedParticipant,
      nickname,
      participantIndex,
    }),
    turnOrder: matchedParticipant?.turnOrder,
  };
}

/** 참가자 변경 내용을 현재 대기실 목록에 반영 */
export function mergeDraftInviteParticipantList({
  currentParticipants,
  eventPayload,
  fallbackHostName,
}: MergeDraftInviteParticipantListParams) {
  if (eventPayload.participants.length > 0) {
    return mergeParticipantItemsFromEvent(currentParticipants, eventPayload.participants);
  }

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
    const currentParticipant = currentParticipants.find((participant) => participant.nickname === nickname);

    return mergeParticipantItem({
      fallbackHostName,
      matchedParticipant: currentParticipant,
      nickname,
      participantIndex,
    });
  });
}

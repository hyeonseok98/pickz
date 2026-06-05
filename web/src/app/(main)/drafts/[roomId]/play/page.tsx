import { DraftRoomHeader, DraftRoomSectionCard, DraftRoomStatusChip } from "@/components/draft/room";
import { draftTypeLabelMap, participationModeLabelMap } from "@/constants/drafts";
import type { DraftType, ParticipationMode } from "@/types/drafts";

interface PartyDraftPlayPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    draftType?: string | string[];
    mode?: string | string[];
    type?: string | string[];
  }>;
}

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function sanitizeDraftType(value: string | null): DraftType {
  return value === "auction" ? "auction" : "snake";
}

function sanitizeParticipationMode(value: string | null): ParticipationMode {
  return value === "party" ? "party" : "solo";
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

export default async function PartyDraftPlayPage({
  params,
  searchParams,
}: PartyDraftPlayPageProps) {
  const { roomId } = await params;
  const resolvedSearchParams = await searchParams;
  const draftType = sanitizeDraftType(
    getSearchParamValue(resolvedSearchParams.draftType) ??
      getSearchParamValue(resolvedSearchParams.type),
  );
  const participationMode = sanitizeParticipationMode(getSearchParamValue(resolvedSearchParams.mode));

  return (
    <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5">
        <DraftRoomHeader
          backHref="/draft"
          backLabel="드래프트로 돌아가기"
          description="party 모드 게임 진행을 위한 공용 게임룸 shell입니다."
          title="같이하기 게임룸"
        />

        <DraftRoomSectionCard
          title="게임룸 요약"
          description="현재는 roomId 기반 진입과 공용 레이아웃만 먼저 연결한 상태입니다."
        >
          <div className="grid gap-3 lg:grid-cols-4">
            <SummaryItem label="방 ID" value={roomId} />
            <SummaryItem label="드래프트 방식" value={draftTypeLabelMap[draftType]} />
            <SummaryItem label="참여 방식" value={participationModeLabelMap[participationMode]} />
            <SummaryItem label="연결 방식" value="STOMP 연결 예정" />
          </div>
        </DraftRoomSectionCard>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <DraftRoomSectionCard
            title="드래프트 보드"
            description="다음 단계에서 solo room과 같은 보드 UI를 공유하도록 연결합니다."
          >
            <div className="flex h-full min-h-64 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-muted">
              <p className="text-sm font-semibold text-text-secondary">
                공용 보드 패널 연결 예정
              </p>
            </div>
          </DraftRoomSectionCard>

          <div className="flex flex-col gap-5">
            <DraftRoomSectionCard
              title="진행 상태"
              description="현재 턴, 온라인 수, 남은 시간은 이후 room event와 연결합니다."
            >
              <div className="flex flex-wrap gap-2">
                <DraftRoomStatusChip tone="muted">roomId {roomId}</DraftRoomStatusChip>
                <DraftRoomStatusChip tone="muted">party mode</DraftRoomStatusChip>
                <DraftRoomStatusChip tone="muted">실시간 연결 준비중</DraftRoomStatusChip>
              </div>
            </DraftRoomSectionCard>

            <DraftRoomSectionCard
              title="팀 현황 / 채팅"
              description="시안 기준 우측 패널 영역입니다. 다음 단계에서 팀 현황과 채팅을 분리합니다."
            >
              <div className="space-y-3">
                <div className="flex h-28 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-muted">
                  <p className="text-sm font-semibold text-text-secondary">팀 현황 패널 예정</p>
                </div>
                <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-border bg-surface-muted">
                  <p className="text-sm font-semibold text-text-secondary">채팅 패널 예정</p>
                </div>
              </div>
            </DraftRoomSectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}

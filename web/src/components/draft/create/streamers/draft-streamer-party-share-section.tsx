import Image from "next/image";
import { SectionCard, StatusChip } from "./draft-streamer-setup-primitives";

interface DraftStreamerPartyShareSectionProps {
  copied: boolean;
  inviteLink: string;
  maxPartyParticipants: number;
  onCopyInviteLink: () => void;
  partyParticipantSlots: Array<{ id: string; name: string; status: string } | null>;
  visiblePartyParticipantsCount: number;
}

export function DraftStreamerPartyShareSection({
  copied,
  inviteLink,
  maxPartyParticipants,
  onCopyInviteLink,
  partyParticipantSlots,
  visiblePartyParticipantsCount,
}: DraftStreamerPartyShareSectionProps) {
  return (
    <SectionCard
      className="xl:col-span-11"
      title="참여 상태 및 공유"
      description="같이하기에서는 링크 공유와 현재 참여자 상태를 위쪽에서 바로 확인합니다."
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="rounded-3xl border border-border bg-linear-to-br from-surface via-surface to-violet-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Share Link
            </p>
            <p className="mt-2 text-base font-bold tracking-[-0.03em] text-text-primary">
              링크만 공유하면 바로 입장
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              같은 URL을 전달하면 참여자가 바로 들어올 수 있습니다.
            </p>

            <div className="mt-4 rounded-2xl border border-border bg-surface px-3 py-3">
              <p className="text-xs font-semibold text-text-secondary">초대 URL</p>
              <p className="mt-2 break-all text-sm font-medium leading-6 text-text-primary">
                {inviteLink}
              </p>
            </div>

            <button
              type="button"
              onClick={onCopyInviteLink}
              className="mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
            >
              <Image src="/icons/copy_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
              <span>{copied ? "복사 완료" : "링크 복사"}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs font-semibold text-text-secondary">공유 안내</p>
            <p className="mt-2 text-sm leading-6 text-text-primary">
              링크 전달 후 오른쪽 입장 현황에서 누가 들어왔는지만 확인하면 됩니다.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface-muted p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">입장 현황</p>
              <h3 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-text-primary">
                {visiblePartyParticipantsCount} / {maxPartyParticipants} 입장
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                참여 인원은 현재 팀 개수 기준으로 입장하며, 먼저 들어온 순서대로 방에 표시됩니다.
              </p>
            </div>
            <StatusChip tone="muted">팀 개수 기준</StatusChip>
          </div>

          <div className="mt-4 space-y-2">
            {partyParticipantSlots.map((participant, index) =>
              participant ? (
                <div
                  key={participant.id}
                  className="rounded-2xl border border-border bg-surface px-3 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {participant.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">{participant.status}</p>
                    </div>
                    <StatusChip className="shrink-0" tone="muted">
                      입장
                    </StatusChip>
                  </div>
                </div>
              ) : (
                <div
                  key={`party-slot-${index + 1}`}
                  className="rounded-2xl border border-dashed border-border bg-surface px-3 py-3"
                >
                  <p className="text-sm font-semibold text-text-secondary">참여자 슬롯 {index + 1}</p>
                  <p className="mt-1 text-xs text-text-muted">링크 공유 후 순서대로 입장합니다.</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

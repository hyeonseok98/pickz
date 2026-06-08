import Image from "next/image";
import { cn } from "@/utils";
import type { DraftInviteParticipantItem, DraftInviteRoleSlot } from "@/types/draft";

interface DraftInviteParticipantListProps {
  participantCountLabel: string;
  participants: DraftInviteParticipantItem[];
  roleSlots: DraftInviteRoleSlot[];
}

function createRoleLabel(roleSlot: DraftInviteRoleSlot) {
  return `${roleSlot.teamNumber}팀 감독`;
}

function createStatusLabel(participant: DraftInviteParticipantItem | null) {
  if (!participant) {
    return "대기 중";
  }

  if (participant.status === "선택 완료") {
    return "선택 완료";
  }

  return participant.isHost ? "선택 완료" : "대기 중";
}

export function DraftInviteParticipantList({
  participantCountLabel,
  participants,
  roleSlots,
}: DraftInviteParticipantListProps) {
  const rowCount = Math.max(roleSlots.length, participants.length, 1);

  return (
    <section id="waiting-room" className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">대기실 ({participantCountLabel})</h2>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[80px_200px_minmax(0,1fr)_140px] bg-violet-50 px-4 py-2.5 text-xs font-bold text-text-secondary">
          <p className="text-center">픽 순서</p>
          <p>감독(팀)</p>
          <p>참여자</p>
          <p className="text-center">상태</p>
        </div>

        {Array.from({ length: rowCount }, (_, index) => {
          const participant = participants[index] ?? null;
          const roleSlot = roleSlots[index] ?? { id: `empty-${index}`, teamNumber: index + 1 };
          const roleLabel = createRoleLabel(roleSlot);
          const statusLabel = createStatusLabel(participant);

          return (
            <div
              key={participant?.id ?? `empty-${index}`}
              className="grid grid-cols-[80px_200px_minmax(0,1fr)_140px] items-center border-t border-border px-4 py-2.5"
            >
              <div className="flex justify-center">
                <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-bold text-text-secondary">
                  {index + 1}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted">
                  <Image src="/icons/person_outline.svg" alt="" width={18} height={18} aria-hidden className="size-[18px] opacity-70" />
                </div>
                <p className="text-sm font-bold text-text-primary">{roleLabel}</p>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <Image src="/icons/person_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4 opacity-70" />
                <p className="truncate text-sm font-semibold text-text-primary">
                  {participant?.nickname ?? "대기 중"}
                </p>
                {participant?.isHost ? (
                  <span className="inline-flex h-6 items-center rounded-full bg-violet-100 px-2.5 text-[11px] font-bold text-violet-700">
                    방장
                  </span>
                ) : null}
              </div>

              <div className="flex justify-center">
                <span
                  className={cn(
                    "inline-flex h-7 items-center rounded-full px-3 text-xs font-bold",
                    statusLabel === "선택 완료"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-surface-muted text-text-secondary",
                  )}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

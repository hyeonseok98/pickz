import Image from "next/image";
import { cn } from "@/utils";
import type { DraftInviteRoleSlot } from "@/hooks/drafts/use-draft-invite-room";

interface DraftInviteParticipantItem {
  id: string;
  isHost: boolean;
  nickname: string;
  status: string;
}

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
    <section id="waiting-room" className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">대기실 ({participantCountLabel})</h2>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border">
        <div className="grid grid-cols-[96px_240px_minmax(0,1fr)_180px] bg-violet-50 px-4 py-3 text-sm font-bold text-text-secondary">
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
              className="grid grid-cols-[96px_240px_minmax(0,1fr)_180px] items-center border-t border-border px-4 py-4"
            >
              <div className="flex justify-center">
                <span className="inline-flex min-w-[40px] items-center justify-center rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-sm font-bold text-text-secondary">
                  {index + 1}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted">
                  <Image src="/icons/person_outline.svg" alt="" width={22} height={22} aria-hidden className="size-[22px] opacity-70" />
                </div>
                <p className="text-lg font-bold text-text-primary">{roleLabel}</p>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <Image src="/icons/person_outline.svg" alt="" width={18} height={18} aria-hidden className="size-[18px] opacity-70" />
                <p className="truncate text-lg font-semibold text-text-primary">
                  {participant?.nickname ?? "대기 중"}
                </p>
                {participant?.isHost ? (
                  <span className="inline-flex h-7 items-center rounded-full bg-violet-100 px-3 text-xs font-bold text-violet-700">
                    방장
                  </span>
                ) : null}
              </div>

              <div className="flex justify-center">
                <span
                  className={cn(
                    "inline-flex h-8 items-center rounded-full px-4 text-sm font-bold",
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

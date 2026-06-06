interface DraftInviteParticipantItem {
  id: string;
  isHost: boolean;
  nickname: string;
  status: string;
}

interface DraftInviteParticipantListProps {
  participantCountLabel: string;
  participants: DraftInviteParticipantItem[];
}

export function DraftInviteParticipantList({
  participantCountLabel,
  participants,
}: DraftInviteParticipantListProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">참가자 대기실</h2>
          <p className="mt-1.5 text-sm leading-5 text-text-secondary">
            참가자가 입장하면 실시간으로 목록을 갱신합니다.
          </p>
        </div>
        <span className="inline-flex h-8 items-center rounded-full border border-border bg-surface-muted px-3 text-xs font-semibold text-text-secondary">
          {participantCountLabel}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {participants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-secondary">
            아직 입장한 참가자가 없습니다.
          </div>
        ) : (
          participants.map((participant, index) => (
            <article key={participant.id} className="rounded-2xl border border-border bg-surface-muted px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{participant.nickname}</p>
                  <p className="mt-1 text-xs text-text-secondary">{participant.status}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {participant.isHost ? (
                    <span className="inline-flex h-7 items-center rounded-full border border-violet-200 bg-violet-100 px-3 text-[11px] font-semibold text-violet-700">
                      방장
                    </span>
                  ) : null}
                  <span className="inline-flex h-7 items-center rounded-full border border-border bg-surface px-3 text-[11px] font-semibold text-text-secondary">
                    순서 {index + 1}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

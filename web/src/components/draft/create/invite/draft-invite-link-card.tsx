import Image from "next/image";

interface DraftInviteLinkCardProps {
  inviteLink: string;
  isHost: boolean;
  onCopyInviteLink: () => void;
}

export function DraftInviteLinkCard({
  inviteLink,
  isHost,
  onCopyInviteLink,
}: DraftInviteLinkCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-50">
          <Image src="/icons/link.svg" alt="" width={22} height={22} aria-hidden className="size-[22px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">링크 복사</h2>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {isHost
              ? "이 링크를 복사해 참여할 스트리머를 초대하세요."
              : "초대 링크를 통해 입장한 뒤 방장의 시작을 기다립니다."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCopyInviteLink}
        disabled={!inviteLink}
        className="mt-5 flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-4 text-left transition-colors hover:border-violet-200 disabled:cursor-not-allowed disabled:bg-surface-muted"
      >
        <div className="min-w-0">
          <p className="text-base font-bold text-text-primary">링크 복사</p>
          <p className="mt-1 truncate text-xs text-text-secondary">{inviteLink || "생성 중"}</p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-300 bg-surface text-violet-700">
          <Image src="/icons/chevron_right.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
        </span>
      </button>
    </section>
  );
}

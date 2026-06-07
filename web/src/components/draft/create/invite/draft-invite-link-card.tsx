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
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-50">
          <Image src="/icons/link.svg" alt="" width={26} height={26} aria-hidden className="size-[26px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">링크 복사</h2>
          <p className="mt-2 text-base leading-6 text-text-secondary">
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
        className="mt-8 flex w-full items-center justify-between gap-4 rounded-3xl border border-border bg-surface px-5 py-5 text-left transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted"
      >
        <div className="min-w-0">
          <p className="text-xl font-bold text-text-primary">링크 복사</p>
          <p className="mt-2 truncate text-sm text-text-secondary">{inviteLink || "생성 중"}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-violet-300 bg-surface text-violet-700">
          <Image src="/icons/chevron_right.svg" alt="" width={18} height={18} aria-hidden className="size-[18px]" />
        </span>
      </button>
    </section>
  );
}

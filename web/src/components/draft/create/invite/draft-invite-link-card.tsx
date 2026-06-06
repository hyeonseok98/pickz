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
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">초대 링크</h2>
      <p className="mt-1.5 text-sm leading-5 text-text-secondary">
        {isHost
          ? "방장은 초대 링크를 공유하고 참가자 입장 현황을 확인합니다."
          : "참가자는 초대 링크를 통해 입장한 뒤 방장의 시작을 기다립니다."}
      </p>

      <div className="mt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted px-3.5 py-3">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
            {inviteLink || "생성 중"}
          </p>
          <button
            type="button"
            onClick={onCopyInviteLink}
            disabled={!inviteLink}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-3.5 text-sm font-bold text-text-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
          >
            <Image src="/icons/copy_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
            <span>복사</span>
          </button>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

interface DraftInviteLinkCardProps {
  inviteCode?: string;
  inviteLink: string;
  isHost: boolean;
  onCopyInviteLink: () => void;
}

export function DraftInviteLinkCard({
  inviteCode,
  inviteLink,
  isHost,
  onCopyInviteLink,
}: DraftInviteLinkCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">초대 링크</h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {isHost
          ? "방장은 초대 코드를 공유하고 참가자 입장 현황을 확인합니다."
          : "참가자는 초대 링크를 통해 입장한 뒤 방장의 시작을 기다립니다."}
      </p>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold text-text-secondary">초대 코드</p>
          <p className="mt-2 text-sm font-bold text-text-primary">{inviteCode ?? "생성 중"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold text-text-secondary">초대 링크</p>
          <p className="mt-2 break-all text-sm font-medium leading-6 text-text-primary">
            {inviteLink || "생성 중"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCopyInviteLink}
        disabled={!inviteLink}
        className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-bold text-text-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
      >
        <Image src="/icons/copy_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
        <span>링크 복사</span>
      </button>
    </section>
  );
}

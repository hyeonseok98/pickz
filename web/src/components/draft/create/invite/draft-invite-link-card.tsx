import { ChevronRightIcon, LinkIcon } from "@/components/common/icons";
import { Button, SectionCard } from "@/components/common/ui";

interface DraftInviteLinkCardProps {
  inviteLink: string;
  isHost: boolean;
  isRoleOrderLocked: boolean;
  nicknameLabel: string;
  onCompleteRoleOrder: () => void;
  onCopyInviteLink: () => void;
}

export function DraftInviteLinkCard({
  inviteLink,
  isHost,
  isRoleOrderLocked,
  nicknameLabel,
  onCompleteRoleOrder,
  onCopyInviteLink,
}: DraftInviteLinkCardProps) {
  const actionLabel = isHost
    ? isRoleOrderLocked
      ? "링크 복사"
      : "픽 순서 배치 완료"
    : "링크 복사";
  const actionDescription = isHost
    ? isRoleOrderLocked
      ? inviteLink || "생성 중"
      : "픽 순서를 고정한 뒤 초대 링크를 복사할 수 있습니다."
    : inviteLink || "생성 중";

  return (
    <SectionCard padding="sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
          <LinkIcon className="size-[22px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">링크 복사</h2>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {isHost
              ? "픽 순서를 먼저 고정한 뒤 이 링크로 참여할 스트리머를 초대하세요."
              : "초대 링크를 통해 입장한 뒤 방장의 시작을 기다립니다."}
          </p>
        </div>
      </div>

      <Button
        onClick={isHost && !isRoleOrderLocked ? onCompleteRoleOrder : onCopyInviteLink}
        disabled={isHost ? false : !inviteLink}
        variant="secondary"
        className="mt-5 h-auto justify-between gap-3 px-4 py-4 text-left hover:border-violet-200"
        fullWidth
        trailingIcon={
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-300 bg-surface text-violet-700">
            <ChevronRightIcon className="size-4" />
          </span>
        }
      >
        <div className="min-w-0">
          <p className="text-base font-bold text-text-primary">{actionLabel}</p>
          <p className="mt-1 truncate text-xs text-text-secondary">{actionDescription}</p>
        </div>
      </Button>

      <div className="mt-3 rounded-2xl border border-border bg-surface-muted px-4 py-3">
        <p className="text-xs font-semibold text-text-secondary">현재 참여자</p>
        <p className="mt-1 text-sm font-bold text-text-primary">{nicknameLabel}</p>
      </div>
    </SectionCard>
  );
}

import Link from "next/link";
import { DraftActionFooter } from "../common/draft-action-footer";
import { DraftStepper } from "../common/draft-stepper";
import { DraftInviteLinkCard } from "./draft-invite-link-card";
import { DraftInviteParticipantList } from "./draft-invite-participant-list";

interface DraftInviteSummaryItem {
  label: string;
  value: string;
}

interface DraftInviteParticipantItem {
  id: string;
  isHost: boolean;
  nickname: string;
  status: string;
}

interface DraftInviteScreenProps {
  backHref: string;
  connectionStatus: string;
  errorMessage: string;
  infoMessage: string;
  inviteCode?: string;
  inviteLink: string;
  isHost: boolean;
  isInitializing: boolean;
  isPartyMode: boolean;
  isStarting: boolean;
  participantCountLabel: string;
  participants: DraftInviteParticipantItem[];
  primaryActionDisabled: boolean;
  primaryActionLabel: string;
  summaryItems: DraftInviteSummaryItem[];
  onCopyInviteLink: () => void;
  onStartDraft: () => void;
}

function SummaryItem({ label, value }: DraftInviteSummaryItem) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

function StatusBanner({
  message,
  tone,
}: {
  message: string;
  tone: "default" | "error";
}) {
  return (
    <div
      className={
        tone === "error"
          ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          : "rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-text-secondary"
      }
    >
      {message}
    </div>
  );
}

export function DraftInviteScreen({
  backHref,
  connectionStatus,
  errorMessage,
  infoMessage,
  inviteCode,
  inviteLink,
  isHost,
  isInitializing,
  isPartyMode,
  isStarting,
  participantCountLabel,
  participants,
  primaryActionDisabled,
  primaryActionLabel,
  summaryItems,
  onCopyInviteLink,
  onStartDraft,
}: DraftInviteScreenProps) {
  if (!isPartyMode) {
    return (
      <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-text-primary">접근할 수 없는 단계입니다.</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            참가자 초대는 같이하기 모드에서만 사용할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5">
        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <Link
            href={backHref}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <span>참가 스트리머 설정으로 돌아가기</span>
          </Link>

          <DraftStepper currentStep="invite" mode="party" />

          <div className="mt-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
              참가자 초대
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              방 생성, 참가자 입장, 대기실 확인, 게임 시작을 이 단계에서 처리합니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            {summaryItems.map((item) => (
              <SummaryItem key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <StatusBanner
              message={
                isInitializing
                  ? "대기실 정보를 준비하는 중입니다."
                  : `현재 연결 상태: ${connectionStatus}`
              }
              tone="default"
            />
            {errorMessage ? <StatusBanner message={errorMessage} tone="error" /> : null}
            {!errorMessage && infoMessage ? <StatusBanner message={infoMessage} tone="default" /> : null}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
          <DraftInviteLinkCard
            inviteCode={inviteCode}
            inviteLink={inviteLink}
            isHost={isHost}
            onCopyInviteLink={onCopyInviteLink}
          />
          <DraftInviteParticipantList
            participantCountLabel={participantCountLabel}
            participants={participants}
          />
        </div>

        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">게임 시작</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {isHost
              ? "참가 인원이 준비되면 팀 수와 팀당 인원 기준으로 게임 시작 요청을 보냅니다."
              : "방장이 게임을 시작하면 자동으로 플레이 화면으로 이동합니다."}
          </p>

          <DraftActionFooter
            className="mt-5"
            title={isHost ? "방장만 게임을 시작할 수 있습니다." : "방장의 시작 요청을 기다리는 중입니다."}
            description={
              isHost
                ? "현재 입장 인원이 팀 수 기준을 만족해야 시작 요청이 가능합니다."
                : "시작 이벤트를 수신하면 자동으로 게임룸으로 이동합니다."
            }
            primaryDisabled={primaryActionDisabled}
            primaryLabel={isStarting ? "시작 요청 중" : primaryActionLabel}
            onPrimaryClick={onStartDraft}
          />
        </section>
      </div>
    </main>
  );
}

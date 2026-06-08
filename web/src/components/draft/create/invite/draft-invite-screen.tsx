import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/utils";
import type { DraftInviteParticipantItem, DraftInviteRoleSlot } from "@/types/draft";
import { DraftInviteLinkCard } from "./draft-invite-link-card";
import { DraftInviteParticipantList } from "./draft-invite-participant-list";

interface DraftInviteScreenProps {
  backHref: string;
  bootstrapErrorSource: "create_room" | "join_room" | "session" | "stomp" | "start_draft" | null;
  bootstrapStatus: "idle" | "creating_room" | "joining_room" | "ready" | "bootstrap_error";
  connectionStatus: string;
  errorMessage: string;
  infoMessage: string;
  inviteLink: string;
  isHost: boolean;
  isInitializing: boolean;
  isPartyMode: boolean;
  isStarting: boolean;
  participantCountLabel: string;
  participantRosterCount: number;
  participants: DraftInviteParticipantItem[];
  primaryActionDisabled: boolean;
  primaryActionLabel: string;
  roleSlots: DraftInviteRoleSlot[];
  teamCountValue: number;
  tournamentLabel: string;
  onCopyInviteLink: () => void;
  onMoveRoleSlot: (fromIndex: number, toIndex: number) => void;
  onStartDraft: () => void;
}

interface InviteRoleSlot {
  participant: DraftInviteParticipantItem | null;
  teamNumber: number;
}

function InviteProgressBar() {
  const steps = [
    { id: 1, isActive: false, label: "방 설정" },
    { id: 2, isActive: false, label: "팀 설정" },
    { id: 3, isActive: true, label: "참가자 초대" },
    { id: 4, isActive: false, label: "대기실" },
  ];

  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                step.isActive
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-border bg-surface text-text-secondary",
              )}
            >
              {step.id}
            </span>
            <span className={cn("text-sm font-semibold", step.isActive ? "text-violet-700" : "text-text-secondary")}>
              {step.label}
            </span>
            {index < steps.length - 1 ? <span className="h-px min-w-4 flex-1 bg-border" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  iconSrc,
  label,
  value,
}: {
  iconSrc: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
        <Image src={iconSrc} alt="" width={24} height={24} aria-hidden className="size-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-text-secondary">{label}</p>
        <p className="mt-1 truncate text-lg font-bold text-violet-700">{value}</p>
      </div>
    </div>
  );
}

function InviteInfoBanner({
  bootstrapErrorSource,
  bootstrapStatus,
  connectionStatus,
  errorMessage,
  infoMessage,
  isInitializing,
}: {
  bootstrapErrorSource: DraftInviteScreenProps["bootstrapErrorSource"];
  bootstrapStatus: DraftInviteScreenProps["bootstrapStatus"];
  connectionStatus: string;
  errorMessage: string;
  infoMessage: string;
  isInitializing: boolean;
}) {
  const bootstrapStatusMessage = {
    creating_room: "드래프트 방을 생성하는 중입니다.",
    joining_room: "초대 링크를 통해 대기실에 입장하는 중입니다.",
    ready: infoMessage || "대기실 연결이 준비되었습니다.",
    bootstrap_error: errorMessage,
    idle: isInitializing ? "대기실 정보를 준비하는 중입니다." : `현재 연결 상태: ${connectionStatus}`,
  } satisfies Record<DraftInviteScreenProps["bootstrapStatus"], string>;

  const errorSourceLabel = {
    create_room: "방 생성 실패",
    join_room: "방 입장 실패",
    session: "세션 준비 실패",
    stomp: "대기실 연결 실패",
    start_draft: "시작 요청 실패",
  } satisfies Record<NonNullable<DraftInviteScreenProps["bootstrapErrorSource"]>, string>;

  const message =
    errorMessage && bootstrapErrorSource
      ? `${errorSourceLabel[bootstrapErrorSource]}: ${errorMessage}`
      : bootstrapStatusMessage[bootstrapStatus];
  const isError = Boolean(errorMessage);

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-semibold",
        isError
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-border bg-surface-muted text-text-secondary",
      )}
    >
      {message}
    </div>
  );
}

function InviteRoleSelection({
  participantRosterCount,
  roleSlots,
  onMoveRoleSlot,
}: {
  participantRosterCount: number;
  roleSlots: InviteRoleSlot[];
  onMoveRoleSlot: (fromIndex: number, toIndex: number) => void;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">감독(역할) 선택</h2>
            <span className="inline-flex size-5 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-[11px] font-bold text-violet-700">
              ?
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            드래그하여 순서를 변경할 수 있습니다.
          </p>
        </div>
        <p className="text-xs font-semibold text-text-secondary">팀당 1명씩 선택됩니다.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {roleSlots.map((slot, index) => (
          <div key={slot.teamNumber} className="relative min-w-0">
            <article
              draggable
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={() => {
                if (draggingIndex === null) {
                  return;
                }

                onMoveRoleSlot(draggingIndex, index);
                setDraggingIndex(null);
              }}
              onDragEnd={() => setDraggingIndex(null)}
              className={cn(
                "group min-h-[158px] cursor-grab rounded-2xl border p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md active:cursor-grabbing",
                slot.participant
                  ? "border-violet-200 bg-violet-50/50"
                  : "border-border bg-surface",
                draggingIndex === index ? "scale-[0.98] opacity-70 ring-2 ring-violet-300" : "",
              )}
            >
              <Image
                src="/icons/more_vertical.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden
                className="mx-auto size-4 opacity-60 transition-opacity group-hover:opacity-100"
              />
              <div className="mx-auto mt-2 flex size-12 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
                {slot.participant ? (
                  <span className="text-[11px] font-bold text-violet-700">{slot.participant.nickname.slice(0, 2)}</span>
                ) : (
                  <Image src="/icons/person_outline.svg" alt="" width={24} height={24} aria-hidden className="size-6 opacity-70" />
                )}
              </div>
              <p className="mt-2 text-xs font-semibold text-text-secondary">픽 순서 {index + 1}</p>
              <p className="mt-1 truncate text-base font-bold tracking-[-0.03em] text-text-primary">{slot.teamNumber}팀 감독</p>
              <button
                type="button"
                className={cn(
                  "mt-3 inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-xl border text-sm font-bold transition-colors",
                  slot.participant
                    ? "border-border bg-surface-muted text-text-secondary"
                    : "border-violet-300 bg-surface text-violet-700",
                )}
              >
                {slot.participant ? "선택됨" : "선택"}
              </button>
            </article>
            {index < roleSlots.length - 1 ? (
              <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-lg font-bold text-text-secondary lg:block">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-text-secondary">
          참여자는 선택한 팀의 감독(코치) 역할로 게임에 참여합니다.
        </p>
        <button
          type="button"
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-violet-300 bg-surface px-3 text-xs font-bold text-violet-700"
        >
          <Image src="/icons/group_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
          <span>참여 선수 목록 보기 ({participantRosterCount})</span>
        </button>
      </div>
    </section>
  );
}

function StartSection({
  isStarting,
  primaryActionDisabled,
  primaryActionLabel,
  onStartDraft,
}: {
  isStarting: boolean;
  primaryActionDisabled: boolean;
  primaryActionLabel: string;
  onStartDraft: () => void;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-xl font-bold text-violet-700">
            i
          </span>
          <div>
            <p className="text-base font-bold text-text-primary">
              모든 감독이 참여 완료 상태가 되어야 게임을 시작할 수 있어요.
            </p>
            <p className="mt-1.5 text-sm leading-5 text-text-secondary">
              역할 변경은 대기실 참가자가 있을 때만 가능합니다.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onStartDraft}
        disabled={primaryActionDisabled}
        className={cn(
          "inline-flex min-h-20 items-center justify-center gap-3 rounded-3xl px-6 text-xl font-bold tracking-[-0.03em] transition-colors",
          primaryActionDisabled
            ? "cursor-not-allowed bg-surface-muted text-text-muted"
            : "cursor-pointer bg-violet-600 text-white hover:bg-violet-700",
        )}
      >
        <Image src="/icons/group_outline.svg" alt="" width={24} height={24} aria-hidden className="size-6" />
        <span>{isStarting ? "시작 요청 중" : primaryActionLabel}</span>
      </button>
    </section>
  );
}

export function DraftInviteScreen({
  backHref,
  bootstrapErrorSource,
  bootstrapStatus,
  connectionStatus,
  errorMessage,
  infoMessage,
  inviteLink,
  isHost,
  isInitializing,
  isPartyMode,
  isStarting,
  participantCountLabel,
  participantRosterCount,
  participants,
  primaryActionDisabled,
  primaryActionLabel,
  roleSlots,
  teamCountValue,
  tournamentLabel,
  onCopyInviteLink,
  onMoveRoleSlot,
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

  const inviteRoleSlots: InviteRoleSlot[] = roleSlots.map((roleSlot, index) => ({
    participant: participants[index] ?? null,
    teamNumber: roleSlot.teamNumber,
  }));

  return (
    <main className="min-h-full bg-background px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3">
        <section className="rounded-3xl border border-border bg-surface px-5 py-4 shadow-sm">
          <Link
            href={backHref}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <Image src="/icons/arrow_back.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
            <span>방 설정</span>
          </Link>

          <InviteProgressBar />

          <div className="mt-4">
            <h1 className="text-[1.9rem] font-bold tracking-[-0.05em] text-text-primary">참가자 초대</h1>
            <p className="mt-1 text-sm text-text-secondary">친구를 초대해 드래프트 방에 함께 참여하세요.</p>
          </div>

          <div className="mt-4 grid gap-3 rounded-3xl border border-border bg-surface p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_160px]">
            <SummaryCard iconSrc="/icons/trophy_outline.svg" label="프리셋" value={tournamentLabel} />
            <SummaryCard iconSrc="/icons/setting_outline.svg" label="카테고리" value="롤 (League of Legends)" />
            <SummaryCard iconSrc="/icons/group_outline.svg" label="팀 개수" value={`${teamCountValue}팀`} />
            <div className="hidden items-center justify-center rounded-3xl bg-violet-50/70 lg:flex">
              <div className="relative flex size-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-100 to-white shadow-inner">
                <Image src="/icons/link.svg" alt="" width={38} height={38} aria-hidden className="size-[38px]" />
                <span className="absolute left-5 top-5 size-2 rounded-full bg-violet-300" />
                <span className="absolute bottom-6 right-6 size-2 rounded-full bg-sky-300" />
                <span className="absolute right-4 top-10 size-1.5 rounded-full bg-emerald-300" />
              </div>
            </div>
          </div>
        </section>

        <InviteInfoBanner
          bootstrapErrorSource={bootstrapErrorSource}
          bootstrapStatus={bootstrapStatus}
          connectionStatus={connectionStatus}
          errorMessage={errorMessage}
          infoMessage={infoMessage}
          isInitializing={isInitializing}
        />

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <DraftInviteLinkCard
            inviteLink={inviteLink}
            isHost={isHost}
            onCopyInviteLink={onCopyInviteLink}
          />
          <InviteRoleSelection
            participantRosterCount={participantRosterCount}
            roleSlots={inviteRoleSlots}
            onMoveRoleSlot={onMoveRoleSlot}
          />
        </div>

        <DraftInviteParticipantList
          participantCountLabel={participantCountLabel}
          participants={participants}
          roleSlots={roleSlots}
        />

        <StartSection
          isStarting={isStarting}
          primaryActionDisabled={primaryActionDisabled}
          primaryActionLabel={primaryActionLabel}
          onStartDraft={onStartDraft}
        />
      </div>
    </main>
  );
}

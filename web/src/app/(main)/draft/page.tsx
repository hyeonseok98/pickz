"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/utils";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type DraftType = "snake" | "auction";
type ParticipationMode = "solo" | "party";

interface OptionCardProps {
  description: string;
  helperLabel: string;
  icon: ReactNode;
  isSelected: boolean;
  onClick: () => void;
  points: string[];
  title: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M5 10.5 8.25 13.5 15 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m10.5 5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SnakeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path
        d="M14.5 5.5c-2.6 0-4.5 1.5-4.5 3.7 0 1.8 1.3 3 3.4 3.8l1.5.6c1.7.6 2.6 1.3 2.6 2.5 0 1.5-1.4 2.5-3.4 2.5-2.1 0-3.6-1-3.9-2.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="15.8" cy="6.2" r="1" fill="currentColor" />
      <path
        d="M9.2 8.4c-.8-.4-1.6-.6-2.4-.6-1.7 0-2.8.8-2.8 2.2 0 1.2.9 1.9 2.3 2.3l1.4.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GavelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path d="m9 7 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m7 9 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="m13 4 3 3-3 3-3-3 3-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m6 11-3 3 4 4 3-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
      <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.5 20a5.5 5.5 0 0 1 11 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 20a4.5 4.5 0 0 1 6.5-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" fill="currentColor" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path d="M10 13.5 14 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7.5 15.5 6 17a3.5 3.5 0 1 0 5 5l1.5-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 8.5 18 7a3.5 3.5 0 1 0-5-5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HammerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path d="m9 7 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m7 9 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="m13 4 3 3-3 3-3-3 3-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepChip({ isActive, label }: { isActive?: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex h-8 items-center rounded-full border px-3 text-[11px] font-semibold",
        isActive
          ? "border-violet-300 bg-violet-100 text-violet-800"
          : "border-slate-200 bg-white text-slate-500",
      )}
    >
      {label}
    </div>
  );
}

function SectionHeader({
  description,
  step,
  title,
}: {
  description: string;
  step: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold tracking-[0.18em] text-violet-600 uppercase">{step}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function OptionCard({
  description,
  helperLabel,
  icon,
  isSelected,
  onClick,
  points,
  title,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-full w-full cursor-pointer rounded-3xl border p-4 text-left transition-all",
        isSelected
          ? "border-violet-300 bg-violet-50 shadow-[0_8px_20px_rgba(124,58,237,0.08)]"
          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50",
      )}
    >
      <div className="flex h-full items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-950">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {helperLabel}
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <div
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                isSelected
                  ? "border-violet-500 bg-violet-500 text-white"
                  : "border-slate-300 bg-white text-transparent",
              )}
            >
              <CheckIcon />
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <ul className="space-y-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <span className="size-2 rounded-full bg-violet-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-950">{value}</span>
    </div>
  );
}

function SummaryFeature({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex size-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}

const draftTypeOptions: Record<
  DraftType,
  {
    description: string;
    helperLabel: string;
    points: string[];
    title: string;
  }
> = {
  snake: {
    description: "정해진 순서대로 돌아가며 선수를 선택합니다.",
    helperLabel: "기본 진행",
    points: ["차례 기반 밸런스"],
    title: "스네이크 드래프트",
  },
  auction: {
    description: "예산을 사용해 원하는 선수를 입찰로 영입합니다.",
    helperLabel: "전략 중심",
    points: ["실시간 입찰"],
    title: "경매",
  },
};

const participationModeOptions: Record<
  ParticipationMode,
  {
    description: string;
    helperLabel: string;
    points: string[];
    title: string;
  }
> = {
  solo: {
    description: "다른 사람 없이 혼자 바로 진행할 수 있어요.",
    helperLabel: "빠른 시작",
    points: ["혼자 진행 가능", "빠른 게임 진행"],
    title: "혼자하기",
  },
  party: {
    description: "다른 사람들과 함께 같은 방에서 진행해요.",
    helperLabel: "함께 진행",
    points: ["같은 방 참여", "초대 링크 공유"],
    title: "같이하기",
  },
};

export default function Page() {
  const router = useRouter();
  const [selectedDraftType, setSelectedDraftType] = useState<DraftType>("snake");
  const [selectedParticipationMode, setSelectedParticipationMode] =
    useState<ParticipationMode>("party");

  const summaryFeatures = useMemo(() => {
    if (selectedDraftType === "snake" && selectedParticipationMode === "party") {
      return [
        { id: "snake", icon: <PlayIcon />, label: "순서대로 진행" },
        { id: "party", icon: <PlayIcon />, label: "같은 방 참여" },
        { id: "link", icon: <LinkIcon />, label: "초대 링크 공유" },
      ];
    }

    if (selectedDraftType === "snake" && selectedParticipationMode === "solo") {
      return [
        { id: "snake", icon: <PlayIcon />, label: "순서대로 진행" },
        { id: "solo", icon: <PlayIcon />, label: "혼자 바로 시작" },
        { id: "test", icon: <PlayIcon />, label: "빠른 게임 진행" },
      ];
    }

    if (selectedDraftType === "auction" && selectedParticipationMode === "party") {
      return [
        { id: "auction", icon: <HammerIcon />, label: "실시간 입찰" },
        { id: "party", icon: <PlayIcon />, label: "같은 방 참여" },
        { id: "link", icon: <LinkIcon />, label: "초대 링크 공유" },
      ];
    }

    return [
      { id: "auction", icon: <HammerIcon />, label: "실시간 입찰" },
      { id: "solo", icon: <PlayIcon />, label: "혼자 바로 시작" },
      { id: "test", icon: <PlayIcon />, label: "빠른 게임 진행" },
    ];
  }, [selectedDraftType, selectedParticipationMode]);

  return (
    <main className="h-[calc(100dvh-var(--header-height))] overflow-hidden bg-slate-50 px-6 py-6 xl:px-8">
      <div className="h-full w-full">
        <div className="grid h-full items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StepChip isActive label="1. 방식 선택" />
              <span className="text-xl text-slate-300">›</span>
              <StepChip label="2. 참여 모드" />
              <span className="text-xl text-slate-300">›</span>
              <StepChip label="3. 생성 완료" />
            </div>

            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950">게임 생성</h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                방식과 참여 모드를 선택한 뒤 바로 게임을 만들 수 있어요.
              </p>
            </div>

            <div className="mt-4 grid min-h-0 flex-1 grid-rows-2 gap-4">
              <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <SectionHeader
                  step="STEP 1"
                  title="게임 방식 선택"
                  description="어떤 방식으로 진행할지 먼저 선택해주세요."
                />

                <div className="grid flex-1 gap-4 lg:grid-cols-2">
                  <OptionCard
                    description={draftTypeOptions.snake.description}
                    helperLabel={draftTypeOptions.snake.helperLabel}
                    icon={<SnakeIcon />}
                    isSelected={selectedDraftType === "snake"}
                    onClick={() => {
                      setSelectedDraftType("snake");
                    }}
                    points={draftTypeOptions.snake.points}
                    title={draftTypeOptions.snake.title}
                  />

                  <OptionCard
                    description={draftTypeOptions.auction.description}
                    helperLabel={draftTypeOptions.auction.helperLabel}
                    icon={<GavelIcon />}
                    isSelected={selectedDraftType === "auction"}
                    onClick={() => {
                      setSelectedDraftType("auction");
                    }}
                    points={draftTypeOptions.auction.points}
                    title={draftTypeOptions.auction.title}
                  />
                </div>
              </section>

              <section className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <SectionHeader
                  step="STEP 2"
                  title="참여 모드 선택"
                  description="혼자 진행할지, 함께 진행할지 선택해주세요."
                />

                <div className="grid flex-1 gap-4 lg:grid-cols-2">
                  <OptionCard
                    description={participationModeOptions.solo.description}
                    helperLabel={participationModeOptions.solo.helperLabel}
                    icon={<UserIcon />}
                    isSelected={selectedParticipationMode === "solo"}
                    onClick={() => {
                      setSelectedParticipationMode("solo");
                    }}
                    points={participationModeOptions.solo.points}
                    title={participationModeOptions.solo.title}
                  />

                  <OptionCard
                    description={participationModeOptions.party.description}
                    helperLabel={participationModeOptions.party.helperLabel}
                    icon={<UsersIcon />}
                    isSelected={selectedParticipationMode === "party"}
                    onClick={() => {
                      setSelectedParticipationMode("party");
                    }}
                    points={participationModeOptions.party.points}
                    title={participationModeOptions.party.title}
                  />
                </div>
              </section>
            </div>
          </section>

          <aside className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">Summary</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950">
              현재 선택 방식
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              선택한 내용을 확인한 뒤 바로 게임을 만들 수 있어요.
            </p>

            <div className="mt-5 space-y-2">
              <SummaryRow label="게임 방식" value={draftTypeOptions[selectedDraftType].title} />
              <SummaryRow
                label="참여 모드"
                value={participationModeOptions[selectedParticipationMode].title}
              />
            </div>

            <div className="mt-4 space-y-2.5">
              {summaryFeatures.map((feature) => (
                <SummaryFeature key={feature.id} icon={feature.icon} label={feature.label} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams({
                  mode: selectedParticipationMode,
                  type: selectedDraftType,
                });

                router.push(`/draft/create?${params.toString()}`);
              }}
              className="mt-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-bold text-white"
            >
              <span>방 생성하기</span>
              <ArrowRightIcon />
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

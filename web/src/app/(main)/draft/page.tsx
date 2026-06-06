"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDraftCreateStore } from "@/stores/drafts";
import type { DraftType, ParticipationMode } from "@/types/drafts";
import { cn } from "@/utils";

interface DraftRoomListItem {
  currentCount: number;
  id: string;
  mode: DraftType;
  title: string;
  totalCount: number;
}

interface LineupGroup {
  id: string;
  line: string;
  names: string[];
}

const roomList: DraftRoomListItem[] = [
  { currentCount: 6, id: "1", mode: "snake", title: "자낳대 시즌2 후보 드래프트", totalCount: 10 },
  { currentCount: 8, id: "2", mode: "auction", title: "Pickz 경매 연습방", totalCount: 12 },
  { currentCount: 7, id: "3", mode: "snake", title: "자낳대 팀전 드래프트 연습", totalCount: 10 },
  { currentCount: 6, id: "4", mode: "auction", title: "Pickz 올스타 드래프트", totalCount: 10 },
  { currentCount: 5, id: "5", mode: "snake", title: "자낳대 결승 예측 드래프트", totalCount: 8 },
];

const lineupGroups: LineupGroup[] = [
  { id: "top", line: "탑", names: ["러너", "룩삼", "강소연", "샘웨"] },
  { id: "jungle", line: "정글", names: ["갱맘", "소우릎", "뱅", "운타라"] },
  { id: "mid", line: "미드", names: ["플레임", "앰비션", "헤징", "네클릿"] },
  { id: "adc", line: "원딜", names: ["고수달", "크캣", "캬하하", "순당무"] },
  { id: "support", line: "서폿", names: ["던", "푸린", "윤가놈", "침착맨"] },
  { id: "headCoach", line: "감독", names: ["마린", "베릴", "인간젤리", "큐베"] },
  { id: "coach", line: "코치", names: ["엄티", "로컨", "노페", "플라이"] },
];

function ArrowForwardIcon() {
  return <Image src="/icons/arrow_forward.svg" alt="" width={16} height={16} aria-hidden className="size-4" />;
}

function ModeCard({
  description,
  iconSrc,
  isSelected,
  title,
  onClick,
}: {
  description: string;
  iconSrc: string;
  isSelected: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-24 w-full cursor-pointer items-center justify-between gap-3 rounded-3xl border px-5 py-4 text-left transition-colors",
        isSelected
          ? "border-violet-300 bg-violet-50 shadow-[0_12px_30px_rgba(124,58,237,0.08)]"
          : "border-border bg-surface hover:border-violet-200",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
          <Image src={iconSrc} alt="" width={24} height={24} aria-hidden className="size-6" />
        </span>
        <div className="min-w-0">
          <p className={cn("text-lg font-bold", isSelected ? "text-violet-700" : "text-text-primary")}>{title}</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">{description}</p>
        </div>
      </div>

      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full border",
          isSelected ? "border-violet-300 bg-white text-violet-700" : "border-border bg-surface text-text-secondary",
        )}
      >
        <ArrowForwardIcon />
      </span>
    </button>
  );
}

function GuideCard() {
  return (
    <button
      type="button"
      className="flex min-h-20 w-full cursor-pointer items-center justify-between gap-3 rounded-3xl border border-orange-100 bg-orange-50/40 px-5 py-4 text-left transition-colors hover:border-orange-200"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
          <Image src="/icons/trophy_fill.svg" alt="" width={24} height={24} aria-hidden className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold text-orange-600">가이드 보기</p>
          <p className="mt-1 text-sm text-text-secondary">드래프트가 처음이라면 여기서 시작하세요.</p>
        </div>
      </div>
      <span className="flex size-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500">
        <ArrowForwardIcon />
      </span>
    </button>
  );
}

function RoomModeBadge({ mode }: { mode: DraftType }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full border px-3 text-xs font-bold",
        mode === "snake"
          ? "border-violet-200 bg-white text-violet-700"
          : "border-emerald-200 bg-white text-emerald-700",
      )}
    >
      {mode === "snake" ? "스네이크" : "경매"}
    </span>
  );
}

export default function DraftPage() {
  const router = useRouter();
  const resetDraftCreate = useDraftCreateStore((state) => state.resetDraftCreate);
  const [selectedDraftType] = useState<DraftType>("snake");
  const [selectedParticipationMode, setSelectedParticipationMode] =
    useState<ParticipationMode>("solo");

  const nextCreateHref = useMemo(() => {
    const params = new URLSearchParams({
      draftType: selectedDraftType,
      mode: selectedParticipationMode,
    });

    return `/draft/create?${params.toString()}`;
  }, [selectedDraftType, selectedParticipationMode]);

  const startCreateFlow = () => {
    resetDraftCreate();
    router.push(nextCreateHref);
  };

  const startModeCreateFlow = (participationMode: ParticipationMode) => {
    resetDraftCreate();
    const params = new URLSearchParams({
      draftType: selectedDraftType,
      mode: participationMode,
    });

    router.push(`/draft/create?${params.toString()}`);
  };

  return (
    <main className="min-h-full bg-background px-4 py-3 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-screen-2xl rounded-3xl border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(135deg,#ffffff_0%,#f7f2ff_52%,#efe5ff_100%)] px-5 py-4 sm:px-6 sm:py-5 xl:px-6 xl:py-5">
              <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_248px]">
                <div className="min-w-0">
                  <h1 className="text-[2rem] font-bold leading-[1.28] tracking-[-0.04em] text-text-primary sm:text-[2.2rem] xl:text-[2.45rem]">
                    전략이 모이면
                    <br />
                    완벽한 드래프트가 된다
                    <br />
                    <span className="text-violet-700">Pickz</span>에서 시작하세요
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-5 text-text-secondary">
                    다양한 방식과 프리셋으로 나만의 드래프트를 설계하고, 최고의 선택을 경험하세요.
                  </p>
                </div>

                <div className="hidden lg:flex justify-center">
                  <div className="flex h-44 w-full max-w-[220px] items-center justify-center rounded-[28px] border border-violet-200/70 bg-white/55 shadow-[0_18px_40px_rgba(124,58,237,0.14)] xl:h-48 xl:max-w-[248px]">
                    <Image
                      src="/icons/trophy_fill.svg"
                      alt=""
                      width={104}
                      height={104}
                      aria-hidden
                      className="size-20 opacity-90 xl:size-24"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ModeCard
                description="나만의 전략으로 드래프트를 시작하기"
                iconSrc="/icons/person_fill.svg"
                isSelected={selectedParticipationMode === "solo"}
                title="혼자하기"
                onClick={() => {
                  setSelectedParticipationMode("solo");
                  startModeCreateFlow("solo");
                }}
              />
              <ModeCard
                description="친구와 함께 드래프트 즐기기"
                iconSrc="/icons/group_fill.svg"
                isSelected={selectedParticipationMode === "party"}
                title="같이하기"
                onClick={() => {
                  setSelectedParticipationMode("party");
                  startModeCreateFlow("party");
                }}
              />
            </section>

            <GuideCard />

            <section className="rounded-3xl border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-4">
              <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">참여 가능한 방 목록</h2>

              <div className="mt-3 overflow-hidden rounded-3xl border border-border">
                <div className="grid grid-cols-[minmax(0,1.6fr)_88px_88px_104px] bg-surface-muted px-4 py-2.5 text-xs font-semibold text-text-secondary">
                  <span>방 제목</span>
                  <span>방식</span>
                  <span>인원수</span>
                  <span className="text-right">입장</span>
                </div>
                <div className="divide-y divide-border">
                  {roomList.map((room) => (
                    <div key={room.id} className="grid grid-cols-[minmax(0,1.6fr)_88px_88px_104px] items-center px-4 py-3">
                      <span className="truncate text-sm font-semibold text-text-primary">{room.title}</span>
                      <RoomModeBadge mode={room.mode} />
                      <span className="text-sm font-semibold text-text-secondary">
                        {room.currentCount} / {room.totalCount}
                      </span>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParticipationMode("party");
                            resetDraftCreate();
                            router.push("/draft/create/invite?draftType=snake&mode=party&inviteCode=94be2958&teamCount=5&teamSize=5");
                          }}
                          className="inline-flex h-9 cursor-pointer items-center justify-center rounded-2xl border border-violet-200 bg-white px-4 text-sm font-bold text-violet-700"
                        >
                          참여하기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 2xl:sticky 2xl:top-5">
            <section className="rounded-[28px] border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-[-0.03em] text-text-primary">자낳대 일정</h2>
                <Image src="/icons/calendar_outline.svg" alt="" width={18} height={18} aria-hidden className="size-4.5" />
              </div>

              <div className="mt-3 rounded-3xl bg-[linear-gradient(135deg,#faf7ff_0%,#f0e7ff_100%)] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-text-primary">자낳대 시즌2</p>
                    <p className="mt-1 text-sm text-text-secondary">7월 ~ 8월 진행 예정</p>
                  </div>
                  <Image src="/icons/trophy_fill.svg" alt="" width={40} height={40} aria-hidden className="size-10" />
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {["16강", "8강", "4강", "결승"].map((label) => (
                    <div key={label} className="rounded-2xl border border-white/80 bg-white/80 px-2 py-2.5 text-center">
                      <p className="text-sm font-bold text-violet-700">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-4">
              <h3 className="text-lg font-bold tracking-[-0.03em] text-text-primary">자낳대 라인별 참여 스트리머</h3>
              <div className="mt-3 space-y-3">
                {lineupGroups.map((group) => (
                  <div key={group.id} className="rounded-2xl border border-border bg-surface-muted px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{group.line}</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {group.names.map((name) => (
                        <span
                          key={name}
                          className="inline-flex h-7 items-center rounded-full border border-border bg-surface px-2.5 text-[11px] font-semibold text-text-secondary"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={startCreateFlow}
              className="inline-flex h-14 w-full cursor-pointer items-center justify-center rounded-[24px] bg-violet-600 px-5 text-base font-bold text-white shadow-[0_16px_32px_rgba(124,58,237,0.22)]"
            >
              방 만들기
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

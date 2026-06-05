"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DraftActionFooter, DraftStepper } from "@/components/draft/create";
import {
  draftTypeLabelMap,
  participationModeLabelMap,
  teamCountOptions,
  teamSizeOptions,
} from "@/constants/drafts";
import type { DraftType, ParticipationMode } from "@/types/drafts";

function sanitizeDraftType(value: string | null): DraftType {
  return value === "auction" ? "auction" : "snake";
}

function sanitizeParticipationMode(value: string | null): ParticipationMode {
  return value === "party" ? "party" : "solo";
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold text-text-secondary">{label}</p>
      <p className="mt-2 text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

function DraftRoomSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftType = sanitizeDraftType(searchParams.get("draftType") ?? searchParams.get("type"));
  const participationMode = sanitizeParticipationMode(searchParams.get("mode"));
  const nextParams = new URLSearchParams({
    draftType,
    mode: participationMode,
  });

  const handleNext = () => {
    router.push(`/draft/create/streamers?${nextParams.toString()}`);
  };

  return (
    <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5">
        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <Link
            href="/draft"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <Image
              src="/icons/arrow_back.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="size-4"
            />
            <span>드래프트 선택으로 돌아가기</span>
          </Link>

          <DraftStepper currentStep="settings" mode={participationMode} />

          <div className="mt-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
              방 설정
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              선택한 드래프트 방식과 참여 방식을 기준으로 다음 단계에서 참가 스트리머를 설정합니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <SummaryItem label="드래프트 방식" value={draftTypeLabelMap[draftType]} />
            <SummaryItem label="참여 방식" value={participationModeLabelMap[participationMode]} />
            <SummaryItem label="팀 개수" value={`${teamCountOptions.at(-1)}팀까지`} />
            <SummaryItem label="팀당 인원" value={`${teamSizeOptions.at(-1)}명까지`} />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <DraftActionFooter
            title="다음 단계"
            description="방 제목, 프리셋, 팀 구성 입력 UI는 이 페이지에 고정하고, 스트리머 검색과 보드 배치는 다음 라우트에서 처리합니다."
            primaryLabel="다음: 참가 스트리머 설정"
            onPrimaryClick={handleNext}
          />
        </section>
      </div>
    </main>
  );
}

export default function DraftRoomSettingsRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
          <section className="rounded-3xl border border-border bg-surface p-6 text-sm font-semibold text-text-secondary shadow-sm">
            방 설정을 불러오는 중입니다.
          </section>
        </main>
      }
    >
      <DraftRoomSettingsPage />
    </Suspense>
  );
}

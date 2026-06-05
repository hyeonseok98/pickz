"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  DraftActionFooter,
  DraftRoomSettingsForm,
  DraftSettingsSummary,
  DraftStepper,
} from "@/components/draft/create";
import { useDraftRoomSettings } from "@/hooks/drafts";

function DraftRoomSettingsPage() {
  const settings = useDraftRoomSettings();

  if (!settings.isReady) {
    return (
      <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
        <section className="rounded-3xl border border-border bg-surface p-6 text-sm font-semibold text-text-secondary shadow-sm">
          방 설정을 불러오는 중입니다.
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-5">
        <section className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
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

          <DraftStepper currentStep="settings" mode={settings.participationMode} />

          <div className="mt-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
              방 생성하기
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              드래프트 방의 기본 정보를 설정해 주세요.
            </p>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
            <DraftRoomSettingsForm {...settings.formState} />
          </section>

          <DraftSettingsSummary items={settings.summaryItems} />
        </div>

        <section className="rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <DraftActionFooter
            title="설정한 값을 기준으로 참가 스트리머 배치 단계가 열립니다."
            description="프리셋을 선택하면 다음 단계에서 라인별 보드에 자동 배치할 수 있습니다."
            primaryLabel="다음: 참가 스트리머 설정"
            onPrimaryClick={settings.handleNext}
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DraftStepper } from "@/components/draft/create";
import { draftTypeLabelMap, participationModeLabelMap } from "@/constants/drafts";
import type { DraftType, ParticipationMode } from "@/types/drafts";
import { parseDraftRoomSnapshot } from "@/utils";

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

function DraftInviteStepPage() {
  const searchParams = useSearchParams();
  const draftType = sanitizeDraftType(searchParams.get("draftType") ?? searchParams.get("type"));
  const participationMode = sanitizeParticipationMode(searchParams.get("mode"));
  const snapshot = parseDraftRoomSnapshot(searchParams.get("config"));
  const isPartyMode = participationMode === "party";
  const backParams = new URLSearchParams({
    draftType,
    mode: "party",
  });

  return (
    <main className="min-h-full bg-background px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5">
        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          <Link
            href={`/draft/create/streamers?${backParams.toString()}`}
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
            <span>참가 스트리머 설정으로 돌아가기</span>
          </Link>

          <DraftStepper currentStep="invite" mode="party" />

          <div className="mt-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
              참가자 초대
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              같이하기 전용으로 참가자 초대, 역할 선택, 게임 시작 연결을 담당하는 페이지입니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <SummaryItem label="드래프트 방식" value={draftTypeLabelMap[draftType]} />
            <SummaryItem label="참여 방식" value={participationModeLabelMap[participationMode]} />
            <SummaryItem
              label="팀 구성"
              value={
                snapshot
                  ? `${snapshot.teamCount}팀 / 팀당 ${snapshot.membersPerTeam}명`
                  : "설정 정보 없음"
              }
            />
            <SummaryItem
              label="참가 스트리머"
              value={snapshot ? `${snapshot.participantIds.length}명` : "설정 정보 없음"}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface px-5 py-5 shadow-sm sm:px-6">
          {isPartyMode ? (
            <div>
              <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">
                party 게임룸 연결 준비
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                다음 구현 단계에서 방 생성 API, 초대 링크, 참가자 대기실, `/drafts/[roomId]/play` 이동을 이 페이지에 연결합니다.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold tracking-[-0.03em] text-text-primary">
                접근할 수 없는 단계입니다.
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                참가자 초대는 같이하기 모드에서만 사용합니다.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DraftInviteRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
          <section className="rounded-3xl border border-border bg-surface p-6 text-sm font-semibold text-text-secondary shadow-sm">
            참가자 초대 정보를 불러오는 중입니다.
          </section>
        </main>
      }
    >
      <DraftInviteStepPage />
    </Suspense>
  );
}

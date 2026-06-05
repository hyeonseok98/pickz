import Image from "next/image";
import Link from "next/link";
import { draftTypeLabelMap, participationModeLabelMap } from "@/constants/drafts";
import type { DraftType, ParticipationMode } from "@/types/drafts";

interface PartyDraftPlayPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    draftType?: string | string[];
    mode?: string | string[];
    type?: string | string[];
  }>;
}

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

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

export default async function PartyDraftPlayPage({
  params,
  searchParams,
}: PartyDraftPlayPageProps) {
  const { roomId } = await params;
  const resolvedSearchParams = await searchParams;
  const draftType = sanitizeDraftType(
    getSearchParamValue(resolvedSearchParams.draftType) ??
      getSearchParamValue(resolvedSearchParams.type),
  );
  const participationMode = sanitizeParticipationMode(getSearchParamValue(resolvedSearchParams.mode));

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
            <span>드래프트로 돌아가기</span>
          </Link>

          <div className="mt-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
              같이하기 게임룸
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              party 모드 게임 진행을 위한 `/drafts/[roomId]/play` 라우트입니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <SummaryItem label="방 ID" value={roomId} />
            <SummaryItem label="드래프트 방식" value={draftTypeLabelMap[draftType]} />
            <SummaryItem label="참여 방식" value={participationModeLabelMap[participationMode]} />
            <SummaryItem label="연결 방식" value="STOMP 연결 예정" />
          </div>
        </section>
      </div>
    </main>
  );
}

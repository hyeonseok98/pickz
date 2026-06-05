"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DraftInviteScreen } from "@/components/draft/create/invite";
import { useDraftInviteRoom } from "@/hooks/drafts";
import type { DraftType, ParticipationMode, TeamCount, TeamSize } from "@/types/drafts";

function sanitizeDraftType(value: string | null): DraftType {
  return value === "auction" ? "auction" : "snake";
}

function sanitizeParticipationMode(value: string | null): ParticipationMode {
  return value === "party" ? "party" : "solo";
}

function sanitizeTeamCount(value: string | null): TeamCount {
  return value === "2" || value === "3" || value === "4" || value === "5" ? value : "5";
}

function sanitizeTeamSize(value: string | null): TeamSize {
  return value === "3" || value === "4" || value === "5" || value === "6" || value === "7" ? value : "5";
}

function DraftInvitePage() {
  const searchParams = useSearchParams();
  const draftType = sanitizeDraftType(searchParams.get("draftType") ?? searchParams.get("type"));
  const mode = sanitizeParticipationMode(searchParams.get("mode"));
  const inviteCode = searchParams.get("inviteCode") ?? undefined;
  const teamCount = sanitizeTeamCount(searchParams.get("teamCount"));
  const teamSize = sanitizeTeamSize(searchParams.get("teamSize") ?? searchParams.get("membersPerTeam"));
  const inviteRoom = useDraftInviteRoom({
    draftType,
    inviteCode,
    mode,
    teamCount,
    teamSize,
  });

  return (
    <DraftInviteScreen
      backHref={inviteRoom.backHref}
      connectionStatus={inviteRoom.connectionStatus}
      errorMessage={inviteRoom.errorMessage}
      infoMessage={inviteRoom.infoMessage}
      inviteCode={inviteRoom.inviteCode}
      inviteLink={inviteRoom.inviteLink}
      isHost={inviteRoom.isHost}
      isInitializing={inviteRoom.isInitializing}
      isPartyMode={inviteRoom.isPartyMode}
      isStarting={inviteRoom.isStarting}
      participantCountLabel={inviteRoom.participantCountLabel}
      participants={inviteRoom.participants}
      primaryActionDisabled={inviteRoom.primaryActionDisabled}
      primaryActionLabel={inviteRoom.primaryActionLabel}
      summaryItems={inviteRoom.summaryItems}
      onCopyInviteLink={inviteRoom.handleCopyInviteLink}
      onStartDraft={inviteRoom.handleStartDraft}
    />
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
      <DraftInvitePage />
    </Suspense>
  );
}

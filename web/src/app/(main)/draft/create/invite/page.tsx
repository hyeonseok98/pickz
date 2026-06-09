"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DraftInviteScreen } from "@/components/draft/create/invite";
import { useDraftInviteRoom } from "@/hooks/draft";
import type { DraftType, ParticipationMode, TeamCount, TeamSize } from "@/types/draft";
import { parseDraftInviteRoleOrder } from "@/utils";

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

function sanitizeBooleanFlag(value: string | null) {
  return value === "true";
}

function DraftInvitePage() {
  const searchParams = useSearchParams();
  const draftType = sanitizeDraftType(searchParams.get("draftType") ?? searchParams.get("type"));
  const mode = sanitizeParticipationMode(searchParams.get("mode"));
  const inviteCode = searchParams.get("inviteCode") ?? undefined;
  const teamCount = sanitizeTeamCount(searchParams.get("teamCount"));
  const teamSize = sanitizeTeamSize(searchParams.get("teamSize") ?? searchParams.get("membersPerTeam"));
  const headCoachEnabled = sanitizeBooleanFlag(searchParams.get("headCoachEnabled"));
  const coachEnabled = sanitizeBooleanFlag(searchParams.get("coachEnabled"));
  const roleOrderValue = searchParams.get("roleOrder");
  const initialRoleOrderNames = useMemo(
    () => parseDraftInviteRoleOrder(roleOrderValue),
    [roleOrderValue],
  );
  const inviteRoom = useDraftInviteRoom({
    coachEnabled,
    draftType,
    headCoachEnabled,
    initialRoleOrderNames,
    inviteCode,
    mode,
    teamCount,
    teamSize,
  });

  return (
    <DraftInviteScreen
      connectionStatus={inviteRoom.connectionStatus}
      errorMessage={inviteRoom.errorMessage}
      infoMessage={inviteRoom.infoMessage}
      inviteLink={inviteRoom.inviteLink}
      inviteRoomErrorSource={inviteRoom.inviteRoomErrorSource}
      inviteRoomStatus={inviteRoom.inviteRoomStatus}
      isHost={inviteRoom.isHost}
      isInitializing={inviteRoom.isInitializing}
      isLeaving={inviteRoom.isLeaving}
      isPartyMode={inviteRoom.isPartyMode}
      isRoleOrderLocked={inviteRoom.isRoleOrderLocked}
      isStarting={inviteRoom.isStarting}
      nicknameLabel={inviteRoom.nicknameLabel}
      participantRosterCount={inviteRoom.participantRosterCount}
      participantCountLabel={inviteRoom.participantCountLabel}
      participants={inviteRoom.participants}
      primaryActionDisabled={inviteRoom.primaryActionDisabled}
      primaryActionLabel={inviteRoom.primaryActionLabel}
      roleSlots={inviteRoom.roleSlots}
      teamCountValue={inviteRoom.teamCountValue}
      tournamentLabel={inviteRoom.tournamentLabel}
      onCompleteRoleOrder={inviteRoom.handleCompleteRoleOrder}
      onCopyInviteLink={inviteRoom.handleCopyInviteLink}
      onLeaveRoom={inviteRoom.handleLeaveRoom}
      onMoveRoleSlot={inviteRoom.handleMoveRoleSlot}
      onSelectRoleSlot={inviteRoom.handleSelectRoleSlot}
      onStartDraft={inviteRoom.handleStartDraft}
    />
  );
}

export default function DraftInviteRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-4 py-4 sm:px-6 sm:py-5 xl:px-8">
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

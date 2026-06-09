import Image from "next/image";
import { AvatarNameCard, Badge, DataTable, DataTableBodyRow, DataTableCell, DataTableHeaderCell, DataTableHeaderRow, SectionCard, StatusChip } from "@/components/common/ui";
import type { DraftInviteParticipantItem, DraftInviteRoleSlot } from "@/types/draft";

interface DraftInviteParticipantListProps {
  participantCountLabel: string;
  participants: DraftInviteParticipantItem[];
  roleSlots: DraftInviteRoleSlot[];
}

function createRoleLabel(roleSlot: DraftInviteRoleSlot) {
  return roleSlot.coachName;
}

function createStatusLabel(participant: DraftInviteParticipantItem | null) {
  if (!participant) {
    return "대기 중";
  }

  if (participant.isReady || participant.status === "선택 완료") {
    return "선택 완료";
  }

  return "대기 중";
}

export function DraftInviteParticipantList({
  participantCountLabel,
  participants,
  roleSlots,
}: DraftInviteParticipantListProps) {
  const rowCount = Math.max(roleSlots.length, participants.length, 1);
  const participantsWithSelectedRole = participants.filter((participant) =>
    roleSlots.some(
      (roleSlot, roleIndex) =>
        participant.selectedCoachName === roleSlot.coachName ||
        participant.turnOrder === roleIndex + 1,
    ),
  );
  const participantsWithoutSelectedRole = participants.filter(
    (participant) => !participantsWithSelectedRole.some((selectedParticipant) => selectedParticipant.id === participant.id),
  );

  return (
    <SectionCard id="waiting-room" title={`대기실 (${participantCountLabel})`} padding="sm">
      <DataTable layout="fixed" className="mt-3">
        <thead>
          <DataTableHeaderRow>
            <DataTableHeaderCell className="w-20">픽 순서</DataTableHeaderCell>
            <DataTableHeaderCell className="w-52 text-left">감독(팀)</DataTableHeaderCell>
            <DataTableHeaderCell className="text-left">참여자</DataTableHeaderCell>
            <DataTableHeaderCell className="w-36">상태</DataTableHeaderCell>
          </DataTableHeaderRow>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => {
          const roleSlot = roleSlots[index] ?? {
            coachName: `${index + 1}팀 감독`,
            id: `empty-${index}`,
            teamNumber: index + 1,
          };
          const participantWithSelectedRole =
            participants.find((participantItem) => participantItem.selectedCoachName === roleSlot.coachName) ??
            participants.find((participantItem) => participantItem.turnOrder === index + 1) ??
            null;
          const selectedRoleCountBeforeCurrent = roleSlots
            .slice(0, index)
            .filter((previousRoleSlot, previousRoleIndex) =>
              participants.some(
                (participantItem) =>
                  participantItem.selectedCoachName === previousRoleSlot.coachName ||
                  participantItem.turnOrder === previousRoleIndex + 1,
              ),
            ).length;
          const participant =
            participantWithSelectedRole ??
            participantsWithoutSelectedRole[index - selectedRoleCountBeforeCurrent] ??
            null;
          const roleLabel = createRoleLabel(roleSlot);
          const statusLabel = createStatusLabel(participant);

          return (
            <DataTableBodyRow
              key={`waiting-room-row-${roleSlot.id}-${index}`}
            >
              <DataTableCell>
                <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-bold text-text-secondary">
                  {index + 1}
                </span>
              </DataTableCell>

              <DataTableCell className="text-left">
                <div className="flex items-center gap-3">
                  <AvatarNameCard
                    name={roleLabel}
                    imageUrl={roleSlot.coachImageUrl}
                    avatarSize="sm"
                    className="min-w-0 bg-transparent p-0"
                    nameClassName="text-left font-bold"
                  />
                </div>
              </DataTableCell>

              <DataTableCell className="text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Image src="/icons/person_outline.svg" alt="" width={16} height={16} aria-hidden className="size-4 opacity-70" />
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {participant?.nickname ?? "대기 중"}
                  </p>
                  {participant?.isHost ? <Badge tone="brand" variant="soft">방장</Badge> : null}
                </div>
              </DataTableCell>

              <DataTableCell>
                <StatusChip tone={statusLabel === "선택 완료" ? "active" : "muted"}>{statusLabel}</StatusChip>
              </DataTableCell>
            </DataTableBodyRow>
          );
        })}
        </tbody>
      </DataTable>
    </SectionCard>
  );
}

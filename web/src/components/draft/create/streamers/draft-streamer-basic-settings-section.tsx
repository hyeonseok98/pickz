import { FieldLabel, SelectField } from "./draft-streamer-setup-primitives";
import type { TeamCount, TeamSize } from "@/types/drafts";

interface DraftStreamerBasicSettingsSectionProps {
  onTeamCountChange: (value: string) => void;
  onTeamSizeChange: (value: string) => void;
  onTournamentChange: (value: string) => void;
  teamCount: TeamCount;
  teamCountOptions: TeamCount[];
  teamSize: TeamSize;
  teamSizeOptions: TeamSize[];
  tournamentId: string;
  tournamentOptions: Array<{ id: string; name: string }>;
}

export function DraftStreamerBasicSettingsSection({
  onTeamCountChange,
  onTeamSizeChange,
  onTournamentChange,
  teamCount,
  teamCountOptions,
  teamSize,
  teamSizeOptions,
  tournamentId,
  tournamentOptions,
}: DraftStreamerBasicSettingsSectionProps) {
  return (
    <div className="mt-6 border-t border-border pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">기본 설정</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          방 설정을 기준으로 참가 스트리머를 검색하고 보드에 배치합니다.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <FieldLabel>대회 선택</FieldLabel>
          <SelectField
            value={tournamentId}
            onChange={onTournamentChange}
            options={tournamentOptions.map((tournament) => ({
              label: tournament.name,
              value: tournament.id,
            }))}
          />
          <p className="text-xs leading-5 text-text-secondary">
            사용자 설정에서는 보드가 비어 있는 상태로 시작합니다.
          </p>
        </div>

        <div className="space-y-2">
          <FieldLabel>팀 개수</FieldLabel>
          <SelectField
            value={teamCount}
            onChange={onTeamCountChange}
            options={teamCountOptions.map((option) => ({
              label: `${option}팀`,
              value: option,
            }))}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>팀당 인원</FieldLabel>
          <SelectField
            value={teamSize}
            onChange={onTeamSizeChange}
            options={teamSizeOptions.map((option) => ({
              label: `${option}명`,
              value: option,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

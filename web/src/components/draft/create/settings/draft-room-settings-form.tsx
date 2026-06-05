import type { DraftRoomSettingsFormProps, DraftRoomSettingsOption } from "@/hooks/drafts";
import type { ReactNode } from "react";
import { DraftOptionCard } from "./draft-option-card";

function FormSection({
  children,
  optional,
  title,
}: {
  children: ReactNode;
  optional?: boolean;
  title: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">
          {optional ? "선택" : "필수"}
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SelectControl<TValue extends string>({
  label,
  onChange,
  options,
  parseValue,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: TValue[];
  parseValue: (value: string) => TValue;
  value: TValue;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-text-primary">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          onChange(parseValue(event.target.value));
        }}
        className="mt-3 h-12 w-full cursor-pointer rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors outline-none focus:border-violet-300"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RoomTitleField({
  onRoomTitleChange,
  roomTitle,
}: {
  onRoomTitleChange: (roomTitle: string) => void;
  roomTitle: string;
}) {
  return (
    <input
      value={roomTitle}
      onChange={(event) => {
        onRoomTitleChange(event.target.value);
      }}
      placeholder="예) 자낭대 시즌2 연습방"
      className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-text-primary transition-colors outline-none placeholder:text-text-muted focus:border-violet-300"
    />
  );
}

function DraftOptionGroup<TValue extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: TValue) => void;
  options: DraftRoomSettingsOption<TValue>[];
  value: TValue;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {options.map((option) => (
        <DraftOptionCard
          key={option.value}
          description={option.description}
          iconSrc={option.iconSrc}
          isSelected={value === option.value}
          label={option.label}
          onClick={() => {
            onChange(option.value);
          }}
        />
      ))}
    </div>
  );
}

function TeamCompositionFields({
  onTeamCountChange,
  onTeamSizeChange,
  teamCount,
  teamCountOptions,
  teamSize,
  teamSizeOptions,
}: Pick<
  DraftRoomSettingsFormProps,
  | "onTeamCountChange"
  | "onTeamSizeChange"
  | "teamCount"
  | "teamCountOptions"
  | "teamSize"
  | "teamSizeOptions"
>) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SelectControl
        label="팀 개수"
        onChange={onTeamCountChange}
        options={teamCountOptions}
        parseValue={(value) => teamCountOptions.find((option) => option === value) ?? teamCount}
        value={teamCount}
      />
      <SelectControl
        label="팀당 인원"
        onChange={onTeamSizeChange}
        options={teamSizeOptions}
        parseValue={(value) => teamSizeOptions.find((option) => option === value) ?? teamSize}
        value={teamSize}
      />
    </div>
  );
}

export function DraftRoomSettingsForm(props: DraftRoomSettingsFormProps) {
  return (
    <div className="space-y-8">
      <FormSection optional title="방 제목">
        <RoomTitleField onRoomTitleChange={props.onRoomTitleChange} roomTitle={props.roomTitle} />
      </FormSection>

      <FormSection title="드래프트 방식 선택">
        <DraftOptionGroup
          onChange={props.onDraftTypeChange}
          options={props.draftTypeOptions}
          value={props.draftType}
        />
      </FormSection>

      <FormSection title="참가 방식 선택">
        <DraftOptionGroup
          onChange={props.onParticipationModeChange}
          options={props.participationModeOptions}
          value={props.participationMode}
        />
      </FormSection>

      <FormSection optional title="프리셋 선택">
        <DraftOptionGroup
          onChange={props.onTournamentChange}
          options={props.tournamentOptions}
          value={props.tournamentId}
        />
      </FormSection>

      <TeamCompositionFields
        onTeamCountChange={props.onTeamCountChange}
        onTeamSizeChange={props.onTeamSizeChange}
        teamCount={props.teamCount}
        teamCountOptions={props.teamCountOptions}
        teamSize={props.teamSize}
        teamSizeOptions={props.teamSizeOptions}
      />
    </div>
  );
}

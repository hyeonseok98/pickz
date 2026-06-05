"use client";

import {
  draftTypeLabelMap,
  participationModeLabelMap,
  teamCountOptions,
  teamSizeOptions,
} from "@/constants/drafts";
import { useDraftCreateStore } from "@/stores/drafts";
import type { DraftType, ParticipationMode, TeamCount, TeamSize } from "@/types/drafts";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export interface DraftRoomSettingsOption<TValue extends string = string> {
  description: string;
  iconSrc: string;
  label: string;
  value: TValue;
}

export interface DraftRoomSettingsSummaryItem {
  iconSrc: string;
  label: string;
  value: string;
}

export interface DraftRoomSettingsFormProps {
  draftType: DraftType;
  draftTypeOptions: DraftRoomSettingsOption<DraftType>[];
  onDraftTypeChange: (draftType: DraftType) => void;
  onParticipationModeChange: (participationMode: ParticipationMode) => void;
  onRoomTitleChange: (roomTitle: string) => void;
  onTeamCountChange: (teamCount: TeamCount) => void;
  onTeamSizeChange: (teamSize: TeamSize) => void;
  onTournamentChange: (tournamentId: string) => void;
  participationMode: ParticipationMode;
  participationModeOptions: DraftRoomSettingsOption<ParticipationMode>[];
  roomTitle: string;
  teamCount: TeamCount;
  teamCountOptions: TeamCount[];
  teamSize: TeamSize;
  teamSizeOptions: TeamSize[];
  tournamentId: string;
  tournamentOptions: DraftRoomSettingsOption[];
}

const defaultTournamentId = "pickz-invitational";

const draftTypeOptions: DraftRoomSettingsOption<DraftType>[] = [
  {
    description: "1 -> N -> N -> 1 순서로 픽하는 방식입니다.",
    iconSrc: "/icons/snake_arrow.svg",
    label: draftTypeLabelMap.snake,
    value: "snake",
  },
  {
    description: "가상의 포인트로 선수를 경매해 영입합니다.",
    iconSrc: "/icons/gavel.svg",
    label: draftTypeLabelMap.auction,
    value: "auction",
  },
];

const participationModeOptions: DraftRoomSettingsOption<ParticipationMode>[] = [
  {
    description: "나만의 전략으로 드래프트를 시작합니다.",
    iconSrc: "/icons/person_fill.svg",
    label: participationModeLabelMap.solo,
    value: "solo",
  },
  {
    description: "친구와 함께 드래프트를 즐깁니다.",
    iconSrc: "/icons/group_fill.svg",
    label: participationModeLabelMap.party,
    value: "party",
  },
];

const tournamentOptions: DraftRoomSettingsOption[] = [
  {
    description: "2026 자낳대 기준 25명 자동 배치 프리셋입니다.",
    iconSrc: "/icons/trophy_fill.svg",
    label: "2026 자낳대",
    value: defaultTournamentId,
  },
  {
    description: "직접 스트리머와 팀 구성을 설정합니다.",
    iconSrc: "/icons/setting_fill.svg",
    label: "사용자 설정",
    value: "custom",
  },
];

function sanitizeDraftType(value: string | null): DraftType {
  return value === "auction" ? "auction" : "snake";
}

function sanitizeParticipationMode(value: string | null): ParticipationMode {
  return value === "party" ? "party" : "solo";
}

function isTeamCount(value: string | null): value is TeamCount {
  return value !== null && teamCountOptions.some((option) => option === value);
}

function sanitizeTeamCount(value: string | null): TeamCount {
  return isTeamCount(value) ? value : "5";
}

function isTeamSize(value: string | null): value is TeamSize {
  return value !== null && teamSizeOptions.some((option) => option === value);
}

function sanitizeTeamSize(value: string | null): TeamSize {
  return isTeamSize(value) ? value : "5";
}

function sanitizeTournamentId(value: string | null): string {
  if (value && tournamentOptions.some((option) => option.value === value)) {
    return value;
  }

  return defaultTournamentId;
}

function createNextStepParams({
  draftType,
  participationMode,
  roomTitle,
  teamCount,
  teamSize,
  tournamentId,
}: {
  draftType: DraftType;
  participationMode: ParticipationMode;
  roomTitle: string;
  teamCount: TeamCount;
  teamSize: TeamSize;
  tournamentId: string;
}) {
  const nextParams = new URLSearchParams({
    draftType,
    mode: participationMode,
    teamCount,
    teamSize,
    tournament: tournamentId,
  });
  const trimmedRoomTitle = roomTitle.trim();

  if (trimmedRoomTitle.length > 0) {
    nextParams.set("roomTitle", trimmedRoomTitle);
  }

  return nextParams;
}

export function useDraftRoomSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDraftType = sanitizeDraftType(
    searchParams.get("draftType") ?? searchParams.get("type"),
  );
  const initialParticipationMode = sanitizeParticipationMode(searchParams.get("mode"));
  const initialTournamentId = sanitizeTournamentId(searchParams.get("tournament"));
  const initialTeamCount = sanitizeTeamCount(searchParams.get("teamCount"));
  const initialTeamSize = sanitizeTeamSize(
    searchParams.get("teamSize") ?? searchParams.get("membersPerTeam"),
  );
  const initialRoomTitle = searchParams.get("roomTitle") ?? "";
  const {
    draftType,
    initializeSettings,
    isInitialized,
    participationMode,
    roomTitle,
    setDraftType,
    setParticipationMode,
    setRoomTitle,
    setTeamCount,
    setTeamSize,
    setTournamentId,
    teamCount,
    teamSize,
    tournamentId,
  } = useDraftCreateStore();

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    initializeSettings({
      draftType: initialDraftType,
      participationMode: initialParticipationMode,
      roomTitle: initialRoomTitle,
      teamCount: initialTeamCount,
      teamSize: initialTeamSize,
      tournamentId: initialTournamentId,
    });
  }, [
    initializeSettings,
    initialDraftType,
    initialParticipationMode,
    initialRoomTitle,
    initialTeamCount,
    initialTeamSize,
    initialTournamentId,
    isInitialized,
  ]);

  const selectedTournament = useMemo(
    () => tournamentOptions.find((option) => option.value === tournamentId) ?? tournamentOptions[0],
    [tournamentId],
  );

  const handleTournamentChange = (nextTournamentId: string) => {
    setTournamentId(nextTournamentId);

    if (nextTournamentId === defaultTournamentId) {
      setTeamCount("5");
      setTeamSize("5");
    }
  };

  const summaryItems = useMemo<DraftRoomSettingsSummaryItem[]>(
    () => [
      {
        iconSrc: "/icons/snake_arrow.svg",
        label: "드래프트 방식",
        value: draftTypeLabelMap[draftType],
      },
      {
        iconSrc: "/icons/person_fill.svg",
        label: "참가 방식",
        value: participationModeLabelMap[participationMode],
      },
      {
        iconSrc: "/icons/trophy_fill.svg",
        label: "프리셋",
        value: selectedTournament.label,
      },
      {
        iconSrc: "/icons/group_fill.svg",
        label: "팀 구성",
        value: `${teamCount}팀 · 팀당 ${teamSize}명`,
      },
    ],
    [draftType, participationMode, selectedTournament.label, teamCount, teamSize],
  );

  const formState: DraftRoomSettingsFormProps = {
    draftType,
    draftTypeOptions,
    onDraftTypeChange: setDraftType,
    onParticipationModeChange: setParticipationMode,
    onRoomTitleChange: setRoomTitle,
    onTeamCountChange: setTeamCount,
    onTeamSizeChange: setTeamSize,
    onTournamentChange: handleTournamentChange,
    participationMode,
    participationModeOptions,
    roomTitle,
    teamCount,
    teamCountOptions,
    teamSize,
    teamSizeOptions,
    tournamentId,
    tournamentOptions,
  };

  const handleNext = () => {
    const nextParams = createNextStepParams({
      draftType,
      participationMode,
      roomTitle,
      teamCount,
      teamSize,
      tournamentId,
    });

    router.push(`/draft/create/streamers?${nextParams.toString()}`);
  };

  return {
    formState,
    handleNext,
    isReady: isInitialized,
    participationMode,
    summaryItems,
  };
}

import type { BoardState, LolLineKey, StreamerDirectoryItem } from "@/types/drafts";
import type { DragEvent } from "react";
import { DraftActionFooter } from "../common/draft-action-footer";
import { BoardSlot, SectionCard } from "./draft-streamer-setup-primitives";

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M15.5 8A6 6 0 1 0 16 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.5 4.5V8h-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DraftStreamerBoardSectionProps {
  activeLineRows: Array<{ key: LolLineKey; label: string }>;
  board: BoardState;
  canCreateRoom: boolean;
  coachEnabled: boolean;
  headCoachEnabled: boolean;
  hoveredSlot: { index: number; line: LolLineKey } | null;
  isPartyMode: boolean;
  onClearAllSlots: () => void;
  onCoachSlotToggle: () => void;
  onHeadCoachSlotToggle: () => void;
  onClearSlot: (line: LolLineKey, index: number) => void;
  onCreateRoom: () => void;
  onParticipantDragEnd: (event: DragEvent<HTMLDivElement>) => void;
  onParticipantDragStart: (event: DragEvent<HTMLDivElement>, streamerId: string) => void;
  onRunAutoPlacement: () => void;
  onSlotDragEnter: (event: DragEvent<HTMLDivElement>, line: LolLineKey, index: number) => void;
  onSlotDragLeave: (line: LolLineKey, index: number) => void;
  onSlotDragOver: (event: DragEvent<HTMLDivElement>, line: LolLineKey, index: number) => void;
  onSlotDrop: (event: DragEvent<HTMLDivElement>, line: LolLineKey, index: number) => void;
  onSlotTap: (line: LolLineKey, index: number) => void;
  onStreamerSelect: (streamerId: string) => void;
  selectedStreamerId: string | null;
  streamerMap: Map<string, StreamerDirectoryItem>;
  visibleColumnCount: number;
}

export function DraftStreamerBoardSection({
  activeLineRows,
  board,
  canCreateRoom,
  coachEnabled,
  headCoachEnabled,
  hoveredSlot,
  isPartyMode,
  onClearAllSlots,
  onCoachSlotToggle,
  onClearSlot,
  onHeadCoachSlotToggle,
  onCreateRoom,
  onParticipantDragEnd,
  onParticipantDragStart,
  onRunAutoPlacement,
  onSlotDragEnter,
  onSlotDragLeave,
  onSlotDragOver,
  onSlotDrop,
  onSlotTap,
  onStreamerSelect,
  selectedStreamerId,
  streamerMap,
  visibleColumnCount,
}: DraftStreamerBoardSectionProps) {
  return (
    <SectionCard
      className="xl:col-span-7"
      title="라인별 스트리머 배치"
      description="현재 설정된 팀 수와 팀당 인원에 맞춰 라인별 보드를 배치해 주세요."
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex h-8 items-center gap-3">
              <span className="text-sm font-semibold text-text-primary">감독 추가</span>
              <button
                type="button"
                role="switch"
                aria-checked={headCoachEnabled}
                onClick={onHeadCoachSlotToggle}
                className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors ${
                  headCoachEnabled ? "bg-violet-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                    headCoachEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="inline-flex h-8 items-center gap-3">
              <span className="text-sm font-semibold text-text-primary">코치 추가</span>
              <button
                type="button"
                role="switch"
                aria-checked={coachEnabled}
                onClick={onCoachSlotToggle}
                className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors ${
                  coachEnabled ? "bg-violet-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                    coachEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={onRunAutoPlacement}
              className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-3.5 text-sm font-semibold text-text-primary"
            >
              <RefreshIcon />
              <span>자동 배치</span>
            </button>
            <button
              type="button"
              onClick={onClearAllSlots}
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-3.5 text-sm font-semibold text-text-primary"
            >
              전체 초기화
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `88px repeat(${visibleColumnCount}, minmax(0, 1fr))` }}
          >
            <div />
            {Array.from({ length: visibleColumnCount }, (_, index) => (
              <div
                key={`slot-header-${index + 1}`}
                className="flex items-center justify-center rounded-2xl bg-surface-muted px-2 py-1.5 text-[11px] font-semibold text-text-secondary"
              >
                슬롯 {index + 1}
              </div>
            ))}

            {activeLineRows.flatMap((line) => {
              const fillCount = board[line.key].slice(0, visibleColumnCount).filter(Boolean).length;

              return [
                <div
                  key={`${line.key}-label`}
                  className="flex items-center justify-center rounded-2xl bg-surface-muted px-2.5 py-2.5 text-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                    <p className="mt-1 text-[11px] text-text-secondary">
                      {fillCount} / {visibleColumnCount} 배치
                    </p>
                  </div>
                </div>,
                ...board[line.key].slice(0, visibleColumnCount).map((streamerId, index) => (
                  <BoardSlot
                    key={`${line.key}-${index}`}
                    draggable={Boolean(streamerId)}
                    dropReady={hoveredSlot?.line === line.key && hoveredSlot.index === index}
                    isMobileViewport={false}
                    onDragEnter={(event) => {
                      onSlotDragEnter(event, line.key, index);
                    }}
                    onDragLeave={() => {
                      onSlotDragLeave(line.key, index);
                    }}
                    onDragOver={(event) => {
                      onSlotDragOver(event, line.key, index);
                    }}
                    onDropStreamer={(event) => {
                      onSlotDrop(event, line.key, index);
                    }}
                    onClear={
                      streamerId
                        ? () => {
                            onClearSlot(line.key, index);
                          }
                        : undefined
                    }
                    onPlaceSelected={undefined}
                    onSelectStreamer={undefined}
                    onStreamerDragEnd={onParticipantDragEnd}
                    onStreamerDragStart={
                      streamerId
                        ? (event) => {
                            onParticipantDragStart(event, streamerId);
                          }
                        : undefined
                    }
                    selected={false}
                    streamer={streamerId ? streamerMap.get(streamerId) : undefined}
                    touchReady={false}
                  />
                )),
              ];
            })}
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          {activeLineRows.map((line) => (
            <div key={line.key} className="rounded-3xl border border-border bg-surface-muted p-3.5">
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                <p className="mt-1 text-[11px] font-semibold text-text-secondary">
                  {board[line.key].slice(0, visibleColumnCount).filter(Boolean).length} /{" "}
                  {visibleColumnCount} 배치
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {board[line.key].slice(0, visibleColumnCount).map((streamerId, index) => (
                  <BoardSlot
                    key={`${line.key}-mobile-${index}`}
                    draggable={Boolean(streamerId)}
                    dropReady={hoveredSlot?.line === line.key && hoveredSlot.index === index}
                    isMobileViewport
                    onDragEnter={(event) => {
                      onSlotDragEnter(event, line.key, index);
                    }}
                    onDragLeave={() => {
                      onSlotDragLeave(line.key, index);
                    }}
                    onDragOver={(event) => {
                      onSlotDragOver(event, line.key, index);
                    }}
                    onDropStreamer={(event) => {
                      onSlotDrop(event, line.key, index);
                    }}
                    onClear={
                      streamerId
                        ? () => {
                            onClearSlot(line.key, index);
                          }
                        : undefined
                    }
                    onPlaceSelected={() => {
                      onSlotTap(line.key, index);
                    }}
                    onSelectStreamer={
                      streamerId
                        ? () => {
                            onStreamerSelect(streamerId);
                          }
                        : undefined
                    }
                    onStreamerDragEnd={onParticipantDragEnd}
                    onStreamerDragStart={
                      streamerId
                        ? (event) => {
                            onParticipantDragStart(event, streamerId);
                          }
                        : undefined
                    }
                    selected={streamerId !== null && selectedStreamerId === streamerId}
                    streamer={streamerId ? streamerMap.get(streamerId) : undefined}
                    touchReady={selectedStreamerId !== null}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <DraftActionFooter
          title="라인별 슬롯 구성이 끝나면 다음 단계로 이동할 수 있습니다."
          description="필요한 인원 배치를 마친 뒤 방 생성 또는 혼자 시작하기를 진행해 주세요."
          primaryLabel={isPartyMode ? "방 생성하기" : "혼자 시작하기"}
          primaryDisabled={!canCreateRoom}
          onPrimaryClick={onCreateRoom}
        />
      </div>
    </SectionCard>
  );
}

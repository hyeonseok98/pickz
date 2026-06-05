import { DraftActionFooter } from "../common/draft-action-footer";
import { BoardSlot, SectionCard, StatusChip } from "./draft-streamer-setup-primitives";
import type { BoardState, LineKey, StreamerDirectoryItem } from "@/types/drafts";
import type { DragEvent } from "react";

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
  activeLineRows: Array<{ key: LineKey; label: string }>;
  board: BoardState;
  canCreateRoom: boolean;
  hoveredSlot: { index: number; line: LineKey } | null;
  isPartyMode: boolean;
  onClearAllSlots: () => void;
  onClearSlot: (line: LineKey, index: number) => void;
  onCreateRoom: () => void;
  onParticipantDragEnd: (event: DragEvent<HTMLDivElement>) => void;
  onParticipantDragStart: (event: DragEvent<HTMLDivElement>, streamerId: string) => void;
  onRunAutoPlacement: () => void;
  onSlotDragEnter: (event: DragEvent<HTMLDivElement>, line: LineKey, index: number) => void;
  onSlotDragLeave: (line: LineKey, index: number) => void;
  onSlotDragOver: (event: DragEvent<HTMLDivElement>, line: LineKey, index: number) => void;
  onSlotDrop: (event: DragEvent<HTMLDivElement>, line: LineKey, index: number) => void;
  onSlotTap: (line: LineKey, index: number) => void;
  onStreamerSelect: (streamerId: string) => void;
  placedCount: number;
  remainingRequiredCount: number;
  requiredPlayerCount: number;
  selectedStreamerId: string | null;
  streamerMap: Map<string, StreamerDirectoryItem>;
  totalSlots: number;
  visibleColumnCount: number;
}

export function DraftStreamerBoardSection({
  activeLineRows,
  board,
  canCreateRoom,
  hoveredSlot,
  isPartyMode,
  onClearAllSlots,
  onClearSlot,
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
  placedCount,
  remainingRequiredCount,
  requiredPlayerCount,
  selectedStreamerId,
  streamerMap,
  totalSlots,
  visibleColumnCount,
}: DraftStreamerBoardSectionProps) {
  return (
    <SectionCard
      className="xl:col-span-7"
      title="라인별 스트리머 배치"
      description="우측 보드는 현재 팀 개수와 팀당 인원 설정에 맞춰 필요한 라인과 슬롯만 보여줍니다."
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <StatusChip tone="muted">보드 슬롯 {totalSlots}칸</StatusChip>
            <StatusChip tone="muted">현재 배치 {placedCount}명</StatusChip>
            <StatusChip tone="muted">현재 설정 필요 {requiredPlayerCount}명</StatusChip>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRunAutoPlacement}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
            >
              <RefreshIcon />
              <span>자동 배치</span>
            </button>
            <button
              type="button"
              onClick={onClearAllSlots}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary"
            >
              전체 초기화
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <div
            className="grid gap-2.5"
            style={{ gridTemplateColumns: `96px repeat(${visibleColumnCount}, minmax(0, 1fr))` }}
          >
            <div />
            {Array.from({ length: visibleColumnCount }, (_, index) => (
              <div
                key={`slot-header-${index + 1}`}
                className="flex items-center justify-center rounded-2xl bg-surface-muted px-2 py-2 text-xs font-semibold text-text-secondary"
              >
                슬롯 {index + 1}
              </div>
            ))}

            {activeLineRows.flatMap((line) => {
              const fillCount = board[line.key].slice(0, visibleColumnCount).filter(Boolean).length;

              return [
                <div
                  key={`${line.key}-label`}
                  className="flex items-center justify-center rounded-2xl bg-surface-muted px-3 py-3 text-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                    <p className="mt-1 text-xs text-text-secondary">
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
            <div key={line.key} className="rounded-3xl border border-border bg-surface-muted p-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">{line.label}</p>
                <p className="mt-1 text-xs font-semibold text-text-secondary">
                  {board[line.key].slice(0, visibleColumnCount).filter(Boolean).length} / {visibleColumnCount} 배치
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          title={
            remainingRequiredCount === 0
              ? "현재 설정 기준 필수 인원 배치가 완료됐습니다."
              : `${remainingRequiredCount}명 더 배치하면 현재 설정 기준을 충족합니다.`
          }
          description="실제 방 생성 조건은 현재 설정한 팀 수와 팀당 인원을 기준으로 계산됩니다."
          primaryLabel={isPartyMode ? "방 생성하기" : "혼자 시작하기"}
          primaryDisabled={!canCreateRoom}
          onPrimaryClick={onCreateRoom}
        />
      </div>
    </SectionCard>
  );
}

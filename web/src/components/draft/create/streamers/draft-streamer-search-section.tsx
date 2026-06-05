import Image from "next/image";
import { DraftStreamerCard } from "@/components/draft/streamer-card";
import { cn } from "@/utils";
import { SectionCard, StatusChip } from "./draft-streamer-setup-primitives";
import type { DragEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from "react";
import type { StreamerDirectoryItem } from "@/types/drafts";

interface SearchResultItem extends StreamerDirectoryItem {
  isParticipant: boolean;
  isPlaced: boolean;
}

interface DraftStreamerSearchSectionProps {
  activeSearchIndex: number;
  draggingStreamerId: string | null;
  filteredStreamers: StreamerDirectoryItem[];
  isMobileViewport: boolean;
  onAddParticipant: (streamerId: string) => void;
  onClearSearchQuery: () => void;
  onHighlightedSearchIndexChange: (index: number) => void;
  onParticipantDragEnd: () => void;
  onParticipantDragStart: (event: DragEvent<HTMLDivElement>, streamerId: string) => void;
  onParticipantRemove: (streamerId: string) => void;
  onParticipantSelect: (streamerId: string) => void;
  onSearchFocus: () => void;
  onSearchKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  onSearchQueryChange: (value: string) => void;
  participantCount: number;
  renderSearchResultStatus: (isParticipant: boolean, isPlaced: boolean) => ReactNode;
  searchFieldRef: RefObject<HTMLDivElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  searchResults: SearchResultItem[];
  selectedStreamerId: string | null;
  showSearchDropdown: boolean;
}

export function DraftStreamerSearchSection({
  activeSearchIndex,
  draggingStreamerId,
  filteredStreamers,
  isMobileViewport,
  onAddParticipant,
  onClearSearchQuery,
  onHighlightedSearchIndexChange,
  onParticipantDragEnd,
  onParticipantDragStart,
  onParticipantRemove,
  onParticipantSelect,
  onSearchFocus,
  onSearchKeyDown,
  onSearchQueryChange,
  participantCount,
  renderSearchResultStatus,
  searchFieldRef,
  searchInputRef,
  searchQuery,
  searchResults,
  selectedStreamerId,
  showSearchDropdown,
}: DraftStreamerSearchSectionProps) {
  return (
    <SectionCard
      className="xl:col-span-4"
      title="검색 및 참여 스트리머"
      description="검색 결과에서 사용자를 추가한 뒤, 참여 스트리머 목록에서 드래그해 보드에 배치합니다."
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <div ref={searchFieldRef} className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              <Image src="/icons/search.svg" alt="" width={16} height={16} aria-hidden className="size-4" />
            </span>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => {
                onSearchQueryChange(event.target.value);
              }}
              onFocus={onSearchFocus}
              onKeyDown={onSearchKeyDown}
              placeholder="스트리머 이름으로 검색"
              className="h-12 w-full rounded-2xl border border-border bg-surface px-4 pl-11 pr-11 text-sm text-text-primary outline-none transition focus:border-violet-300"
              role="combobox"
              aria-expanded={showSearchDropdown}
              aria-controls="streamer-search-results"
              aria-activedescendant={
                activeSearchIndex >= 0 ? `streamer-search-result-${searchResults[activeSearchIndex]?.id}` : undefined
              }
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={onClearSearchQuery}
                className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface-muted text-text-secondary transition-colors hover:text-text-primary"
                aria-label="검색어 지우기"
              >
                <Image src="/icons/x_small.svg" alt="" width={14} height={14} aria-hidden className="size-3.5" />
              </button>
            ) : null}
            {showSearchDropdown ? (
              <div
                id="streamer-search-results"
                role="listbox"
                className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-text-secondary">
                    현재 검색 조건에 맞는 스트리머가 없습니다.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto p-2">
                    {searchResults.map((streamer, index) => (
                      <button
                        type="button"
                        id={`streamer-search-result-${streamer.id}`}
                        key={streamer.id}
                        role="option"
                        aria-selected={activeSearchIndex === index}
                        disabled={streamer.isParticipant}
                        onMouseEnter={() => {
                          onHighlightedSearchIndexChange(index);
                        }}
                        onClick={() => {
                          if (!streamer.isParticipant) {
                            onAddParticipant(streamer.id);
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                          streamer.isParticipant ? "cursor-default opacity-80" : "cursor-pointer",
                          activeSearchIndex === index ? "bg-surface-muted" : "hover:bg-surface-muted",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Image
                            src={streamer.avatarDataUrl}
                            alt={streamer.name}
                            width={44}
                            height={44}
                            unoptimized
                            className="size-11 shrink-0 rounded-full bg-surface-muted object-contain"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-primary">{streamer.name}</p>
                            <p className="mt-1 text-xs text-text-secondary">
                              {streamer.isPlaced
                                ? "현재 보드에 배치된 스트리머"
                                : streamer.isParticipant
                                  ? "참여 스트리머 목록에서 대기 중"
                                  : "선택하면 참여 스트리머에 추가됩니다."}
                            </p>
                          </div>
                        </div>

                        {renderSearchResultStatus(streamer.isParticipant, streamer.isPlaced)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="whitespace-nowrap text-sm font-semibold text-text-primary">참여 스트리머</p>
            <div className="flex flex-wrap gap-2">
              <StatusChip tone="muted">{participantCount}명 참여중</StatusChip>
              <StatusChip tone="muted">{filteredStreamers.length}명 미배치</StatusChip>
            </div>
          </div>

          {filteredStreamers.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-text-secondary">
              {participantCount === 0
                ? "검색 결과에서 추가한 스트리머가 여기에 표시됩니다."
                : "현재 참여 스트리머가 모두 보드에 배치되어 있습니다."}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredStreamers.map((streamer) => (
                <DraftStreamerCard
                  key={streamer.id}
                  avatarDataUrl={streamer.avatarDataUrl}
                  interaction={isMobileViewport ? "select" : "drag"}
                  name={streamer.name}
                  onClick={() => {
                    onParticipantSelect(streamer.id);
                  }}
                  onRemove={() => {
                    onParticipantRemove(streamer.id);
                  }}
                  onDragEnd={onParticipantDragEnd}
                  onDragStart={(event) => {
                    onParticipantDragStart(event, streamer.id);
                  }}
                  tone={
                    draggingStreamerId === streamer.id ||
                    (isMobileViewport && selectedStreamerId === streamer.id)
                      ? "active"
                      : "default"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

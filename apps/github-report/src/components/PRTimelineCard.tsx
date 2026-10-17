import { useState } from 'react';
import {
  GitPullRequest,
  GitCommit,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FolderGit2,
  Calendar,
} from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { AsyncContent, Skeleton, ContentCard, AppButton, AppTabs } from '@nexus/ui';
import type { PRReportItem, DateMode } from '../types';

export interface PRTimelineCardProps {
  prs: PRReportItem[] | undefined;
  isLoading: boolean;
  isBusy?: boolean;
  error: string | null;
  selectedPrNumbers: Set<number>;
  onTogglePr: (prNumber: number) => void;
  onSetAllSelected: (isSelected: boolean) => void;
  dateMode?: DateMode;
  onDateModeChange?: (mode: DateMode) => void;
}

const STATE_BADGE: Record<string, string> = {
  MERGED: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  CLOSED: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  OPEN: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
};

function StateBadge({ state }: { state: string }) {
  const key = state.toUpperCase();
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] font-medium tracking-wide ${STATE_BADGE[key] ?? STATE_BADGE.OPEN}`}
    >
      {key in STATE_BADGE ? key : 'OPEN'}
    </span>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2 rounded-xl border border-sky-500/20 bg-sky-950/20 p-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
          <div className="flex items-center gap-2 pl-6">
            <Skeleton className="h-3 w-8 bg-sky-400/20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 py-7 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-400">
        <GitPullRequest className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-white/80">Không có Pull Request nào</h4>
        <p className="mt-1 max-w-sm text-[11px] text-white/40 leading-relaxed">
          Chưa có PR hoặc commit nào trong khoảng thời gian đã chọn. Thử đổi sang "Ngày trước" hoặc
          bấm "Quét PR" (⌘R).
        </p>
      </div>
    </div>
  );
}

export function PRTimelineCard({
  prs,
  isLoading,
  isBusy = false,
  error,
  selectedPrNumbers,
  onTogglePr,
  onSetAllSelected,
  dateMode,
  onDateModeChange,
}: PRTimelineCardProps) {
  const [collapsedPrs, setCollapsedPrs] = useState<Set<number>>(() => new Set());
  const items = prs ?? [];
  const hasItems = items.length > 0;
  const isAllSelected = hasItems && items.every((pr) => selectedPrNumbers.has(pr.number));

  const toggleCollapse = (prNumber: number) => {
    setCollapsedPrs((prev) => {
      const next = new Set(prev);
      if (next.has(prNumber)) next.delete(prNumber);
      else next.add(prNumber);
      return next;
    });
  };

  const handleOpenLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openUrl(url).catch(() => window.open(url, '_blank'));
  };

  return (
    <ContentCard
      title={
        <span>
          Pull Requests & Commits{' '}
          {prs && <span className="font-normal text-white/50">({items.length})</span>}
        </span>
      }
      icon={FolderGit2}
      actions={
        <div className="flex items-center gap-2">
          {dateMode && onDateModeChange && (
            <AppTabs
              items={[
                { id: 'today', label: 'Hôm nay', icon: Calendar },
                { id: 'last_workday', label: 'Ngày trước' },
              ]}
              activeId={dateMode}
              onChange={(id) => !isBusy && onDateModeChange(id as DateMode)}
              variant="segmented"
              size="sm"
            />
          )}
          <AppButton
            size="sm"
            variant="ghost"
            onClick={() => onSetAllSelected(!isAllSelected)}
            disabled={!hasItems || isLoading || isBusy}
          >
            {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </AppButton>
        </div>
      }
      variant="acrylic"
      padding="md"
      className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
    >
      <AsyncContent
        className="min-h-0 flex-1 overflow-y-auto custom-scrollbar pr-1"
        isLoading={isLoading}
        hasData={hasItems}
        error={error}
        skeleton={<TimelineSkeleton />}
        empty={<TimelineEmpty />}
      >
        <ul className="space-y-2">
          {items.map((pr) => {
            const isSelected = selectedPrNumbers.has(pr.number);
            const isCollapsed = collapsedPrs.has(pr.number);

            return (
              <li
                key={`${pr.repository}#${pr.number}`}
                className={`group rounded-xl border transition-all ${
                  isSelected
                    ? 'border-sky-500/25 bg-sky-950/30 hover:border-sky-500/40 hover:bg-sky-950/50'
                    : 'border-transparent bg-black/20 opacity-45 hover:opacity-75'
                }`}
              >
                <div
                  onClick={() => toggleCollapse(pr.number)}
                  className="flex cursor-pointer items-start gap-2.5 p-2.5"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isLoading || isBusy}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onTogglePr(pr.number)}
                    className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded border-sky-500/40 bg-black/40 text-sky-500 focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <span className="mt-0.5 text-white/40 transition-colors group-hover:text-white/70">
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>

                  {/* Vùng nội dung: PR Title là điểm nhấn chính, metadata ở dưới */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-medium leading-snug text-white/95 transition-colors group-hover:text-white"
                      title={pr.title}
                    >
                      {pr.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                      <span className="font-mono font-medium text-sky-400/90">#{pr.number}</span>
                      <span
                        className="max-w-[160px] truncate rounded border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 font-mono text-sky-300 sm:max-w-[220px]"
                        title={pr.repository}
                      >
                        {pr.repository}
                      </span>
                      <StateBadge state={pr.state} />
                      {pr.commits.length > 0 && (
                        <span className="text-white/40">
                          {pr.commits.length} {pr.commits.length === 1 ? 'commit' : 'commits'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleOpenLink(pr.url, e)}
                    className="shrink-0 rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                    title="Mở Pull Request trên GitHub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!isCollapsed && pr.commits.length > 0 && (
                  <ul className="space-y-1 border-t border-sky-500/20 px-3 pb-2.5 pt-1.5">
                    {pr.commits.map((commit) => (
                      <li
                        key={`${commit.committedDate}-${commit.headline}`}
                        className="flex items-start gap-2 pl-6 text-[11px] text-white/65 hover:text-white/90 transition-colors"
                      >
                        <GitCommit className="mt-0.5 h-3 w-3 shrink-0 text-sky-400/70" />
                        <span className="flex-1 leading-normal truncate" title={commit.headline}>
                          {commit.headline}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </AsyncContent>
    </ContentCard>
  );
}

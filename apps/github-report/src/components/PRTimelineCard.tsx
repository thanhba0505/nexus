import { useState } from 'react';
import {
  GitPullRequest,
  GitCommit,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { AsyncContent, Skeleton } from '@nexus/ui';
import type { PRReportItem } from '../types';

export interface PRTimelineCardProps {
  prs: PRReportItem[] | undefined;
  isLoading: boolean;
  error: string | null;
  selectedPrNumbers: Set<number>;
  onTogglePr: (prNumber: number) => void;
  onSetAllSelected: (isSelected: boolean) => void;
}

const STATE_BADGE: Record<string, string> = {
  MERGED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  CLOSED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  OPEN: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

function StateBadge({ state }: { state: string }) {
  const key = state.toUpperCase();
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${STATE_BADGE[key] ?? STATE_BADGE.OPEN}`}
    >
      {key in STATE_BADGE ? key : 'OPEN'}
    </span>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3 w-10 bg-sky-400/20" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="ml-6 h-3.5 w-4/5" />
          <Skeleton className="ml-6 h-3 w-1/2 bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function TimelineEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
        <GitPullRequest className="h-6 w-6" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white/80">Không có Pull Request nào</h4>
        <p className="mt-1 max-w-sm text-xs text-white/40">
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
  error,
  selectedPrNumbers,
  onTogglePr,
  onSetAllSelected,
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
    <section className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            Pull Requests & Commits{prs ? ` (${items.length})` : ''}
          </h3>
        </div>
        <button
          onClick={() => onSetAllSelected(!isAllSelected)}
          disabled={!hasItems}
          className="text-[11px] text-white/60 transition-colors hover:text-white disabled:opacity-30"
        >
          {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
      </header>

      <AsyncContent
        className="min-h-0 flex-1 overflow-y-auto pr-1"
        isLoading={isLoading}
        hasData={hasItems}
        error={error}
        skeleton={<TimelineSkeleton />}
        empty={<TimelineEmpty />}
      >
        <ul className="space-y-3">
          {items.map((pr) => {
            const isSelected = selectedPrNumbers.has(pr.number);
            const isCollapsed = collapsedPrs.has(pr.number);

            return (
              <li
                key={`${pr.repository}#${pr.number}`}
                className={`rounded-xl border transition-colors ${
                  isSelected
                    ? 'border-white/15 bg-white/5'
                    : 'border-white/5 bg-black/20 opacity-60'
                }`}
              >
                <div
                  onClick={() => toggleCollapse(pr.number)}
                  className="flex cursor-pointer items-start gap-2.5 rounded-t-xl p-3 transition-colors hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onTogglePr(pr.number)}
                    className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded border-white/30 bg-black/40 text-sky-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="mt-0.5 text-white/50">
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="shrink-0 font-mono text-[11px] font-medium text-sky-400">
                        #{pr.number}
                      </span>
                      <span className="max-w-[180px] truncate rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
                        {pr.repository}
                      </span>
                      <StateBadge state={pr.state} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-white/95">
                      {pr.title}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleOpenLink(pr.url, e)}
                    className="shrink-0 rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    title="Mở Pull Request trên GitHub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!isCollapsed && pr.commits.length > 0 && (
                  <ul className="space-y-1.5 border-t border-white/5 px-3 pb-3 pt-2">
                    {pr.commits.map((commit) => (
                      <li
                        key={`${commit.committedDate}-${commit.headline}`}
                        className="flex items-start gap-2 pl-6 text-[11px] text-white/70"
                      >
                        <GitCommit className="mt-0.5 h-3 w-3 shrink-0 text-sky-400/80" />
                        <span className="flex-1 leading-tight">{commit.headline}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </AsyncContent>
    </section>
  );
}

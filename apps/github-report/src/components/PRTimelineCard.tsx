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
        <div
          key={i}
          className="space-y-2 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
        >
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
    <div className="flex h-full flex-col items-center justify-center gap-2.5 p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/30">
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
    <section className="flex min-h-0 w-full flex-1 flex-col gap-2.5 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-md">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-semibold text-white/90">
            Pull Requests & Commits
            {prs && <span className="ml-1.5 font-normal text-white/50">({items.length})</span>}
          </h3>
        </div>
        <button
          onClick={() => onSetAllSelected(!isAllSelected)}
          disabled={!hasItems}
          className="text-[11px] font-medium text-sky-400/80 transition-colors hover:text-sky-300 disabled:opacity-30"
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
        <ul className="space-y-2">
          {items.map((pr) => {
            const isSelected = selectedPrNumbers.has(pr.number);
            const isCollapsed = collapsedPrs.has(pr.number);

            return (
              <li
                key={`${pr.repository}#${pr.number}`}
                className={`group rounded-lg border transition-all ${
                  isSelected
                    ? 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.055]'
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
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onTogglePr(pr.number)}
                    className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded border-white/30 bg-black/40 text-sky-500 focus:ring-0 focus:ring-offset-0"
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
                        className="max-w-[160px] truncate rounded border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 font-mono text-white/60 sm:max-w-[220px]"
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
                    className="shrink-0 rounded p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                    title="Mở Pull Request trên GitHub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!isCollapsed && pr.commits.length > 0 && (
                  <ul className="space-y-1 border-t border-white/[0.04] px-3 pb-2.5 pt-1.5">
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
    </section>
  );
}

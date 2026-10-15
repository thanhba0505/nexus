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
import { PRReportItem } from '../types';

export interface PRTimelineCardProps {
  prs: PRReportItem[];
  selectedPrNumbers: Set<number>;
  onTogglePr: (prNumber: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function PRTimelineCard({
  prs,
  selectedPrNumbers,
  onTogglePr,
  onSelectAll,
  onDeselectAll,
}: PRTimelineCardProps) {
  const [collapsedPrs, setCollapsedPrs] = useState<Set<number>>(new Set());

  const toggleCollapse = (prNumber: number) => {
    setCollapsedPrs((prev) => {
      const next = new Set(prev);
      if (next.has(prNumber)) {
        next.delete(prNumber);
      } else {
        next.add(prNumber);
      }
      return next;
    });
  };

  const handleOpenLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      openUrl(url);
    } catch {
      window.open(url, '_blank');
    }
  };

  const getStatusBadge = (state: string) => {
    switch (state.toUpperCase()) {
      case 'MERGED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            MERGED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            CLOSED
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            OPEN
          </span>
        );
    }
  };

  if (prs.length === 0) {
    return (
      <div className="w-full flex-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
          <GitPullRequest className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/80">Không có Pull Request nào</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm">
            Chưa tìm thấy commit hoặc PR nào được cập nhật trong khoảng thời gian đã chọn. Hãy thử
            đổi sang "Ngày trước" hoặc bấm "Quét PR".
          </p>
        </div>
      </div>
    );
  }

  const allSelected = prs.length > 0 && prs.every((p) => selectedPrNumbers.has(p.number));

  return (
    <div className="w-full flex-1 min-h-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 flex flex-col space-y-3 overflow-hidden shadow-lg shadow-black/20">
      {/* Header của danh sách */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2">
          <FolderGit2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Pull Requests & Commits ({prs.length})
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="text-white/60 hover:text-white transition-colors"
          >
            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
        </div>
      </div>

      {/* Danh sách cuộn */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {prs.map((pr) => {
          const isSelected = selectedPrNumbers.has(pr.number);
          const isCollapsed = collapsedPrs.has(pr.number);

          return (
            <div
              key={pr.number}
              className={`rounded-xl border transition-all ${
                isSelected ? 'bg-white/5 border-white/15' : 'bg-black/20 border-white/5 opacity-60'
              }`}
            >
              {/* Header của từng PR */}
              <div
                onClick={() => toggleCollapse(pr.number)}
                className="p-3 flex items-start space-x-2.5 cursor-pointer hover:bg-white/5 rounded-t-xl transition-colors"
              >
                {/* Checkbox chọn/bỏ chọn */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onTogglePr(pr.number);
                  }}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-white/30 text-sky-500 focus:ring-0 focus:ring-offset-0 bg-black/40 cursor-pointer"
                />

                {/* Nút collapse/expand */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(pr.number);
                  }}
                  className="mt-0.5 text-white/50 hover:text-white"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Thông tin PR */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[11px] font-mono font-medium text-sky-400 shrink-0">
                      #{pr.number}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70 truncate max-w-[180px]">
                      {pr.repository}
                    </span>
                    {getStatusBadge(pr.state)}
                  </div>

                  <p className="text-xs font-medium text-white/95 mt-1 leading-snug line-clamp-2">
                    {pr.title}
                  </p>
                </div>

                {/* Link mở GitHub */}
                <button
                  onClick={(e) => handleOpenLink(pr.url, e)}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="Mở Pull Request trên GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Danh sách commits của PR này */}
              {!isCollapsed && pr.commits.length > 0 && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1.5">
                  {pr.commits.map((commit, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 text-[11px] text-white/70 pl-6"
                    >
                      <GitCommit className="w-3 h-3 text-sky-400/80 mt-0.5 shrink-0" />
                      <span className="flex-1 leading-tight font-sans">{commit.headline}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import {
  RefreshCw,
  Copy,
  Check,
  Settings,
  ExternalLink,
  Calendar,
  GitPullRequest,
} from 'lucide-react';
import { MiniAppHeader } from '@nexus/ui';
import type { DateMode } from '../types';

export interface UnifiedHeaderProps {
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  /** `undefined` khi chưa tải lần nào → hiển thị "—" thay vì "0" gây hiểu nhầm. */
  prCount: number | undefined;
  commitCount: number;
  /** Đang quét PR hoặc đang tóm tắt (icon xoay). */
  isBusy: boolean;
  canCopy: boolean;
  isCopied: boolean;
  destinationLabel: string;
  canReveal: boolean;
  onRefresh: () => void;
  onCopySummary: () => void;
  onRevealDestination: () => void;
  onOpenSettings: () => void;
}

const DATE_MODES: { mode: DateMode; label: string; title: string }[] = [
  { mode: 'today', label: 'Hôm nay', title: 'PR & commit từ 00:00 hôm nay' },
  { mode: 'last_workday', label: 'Ngày trước', title: 'PR & commit từ ngày làm việc gần nhất' },
];

export function UnifiedHeader({
  dateMode,
  onDateModeChange,
  prCount,
  commitCount,
  isBusy,
  canCopy,
  isCopied,
  destinationLabel,
  canReveal,
  onRefresh,
  onCopySummary,
  onRevealDestination,
  onOpenSettings,
}: UnifiedHeaderProps) {
  return (
    <MiniAppHeader
      leftSlot={
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/20 text-sky-400">
              <GitPullRequest className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-white">GitHub Report</span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70 sm:flex">
            <span className="font-medium tabular-nums text-sky-400">{prCount ?? '—'}</span> PRs
            <span className="text-white/30">•</span>
            <span className="font-medium tabular-nums text-emerald-400">
              {prCount === undefined ? '—' : commitCount}
            </span>{' '}
            commits
          </div>
        </div>
      }
      centerSlot={
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
          {DATE_MODES.map(({ mode, label, title }) => (
            <button
              key={mode}
              onClick={() => onDateModeChange(mode)}
              title={title}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                dateMode === mode
                  ? 'bg-sky-500 font-semibold text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {mode === 'today' && <Calendar className="h-3 w-3" />}
              {label}
            </button>
          ))}
        </div>
      }
      rightSlot={
        <>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title="Quét lại PR & tóm tắt (⌘R)"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isBusy ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden md:inline">Quét PR</span>
          </button>

          <button
            onClick={onCopySummary}
            disabled={!canCopy}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            title="Sao chép tóm tắt (⌘C)"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-sky-400" />
                Sao chép
              </>
            )}
          </button>

          {canReveal && (
            <button
              onClick={onRevealDestination}
              className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/30 hover:text-white"
              title={`Chuyển tới ${destinationLabel} trên trình duyệt (⌘P)`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {destinationLabel}
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Cài đặt (⌘,)"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </>
      }
    />
  );
}

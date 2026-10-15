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
        <div data-tauri-drag-region className="flex items-center gap-2">
          <div data-tauri-drag-region className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-sky-500/25 bg-sky-500/15 text-sky-400">
              <GitPullRequest className="h-3.5 w-3.5" />
            </div>
            <span data-tauri-drag-region className="text-xs font-semibold text-white/90">
              GitHub Report
            </span>
          </div>
          <div
            data-tauri-drag-region
            className="hidden h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-white/60 sm:flex"
          >
            <span className="font-medium tabular-nums text-sky-300">{prCount ?? '—'}</span> PRs
            <span className="text-white/20">•</span>
            <span className="font-medium tabular-nums text-emerald-300">
              {prCount === undefined ? '—' : commitCount}
            </span>{' '}
            commits
          </div>
        </div>
      }
      centerSlot={
        <div
          data-no-drag
          data-tauri-drag-region="false"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex h-7 items-center rounded-lg border border-white/[0.08] bg-black/25 p-0.5"
        >
          {DATE_MODES.map(({ mode, label, title }) => (
            <button
              key={mode}
              onClick={() => onDateModeChange(mode)}
              disabled={isBusy}
              title={isBusy ? 'Đang thực hiện tác vụ…' : title}
              className={`flex h-6 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                dateMode === mode
                  ? 'bg-sky-500/90 font-medium text-white shadow-xs'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {mode === 'today' && <Calendar className="h-3 w-3 opacity-80" />}
              {label}
            </button>
          ))}
        </div>
      }
      rightSlot={
        <div
          data-no-drag
          data-tauri-drag-region="false"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex items-center gap-1.5"
        >
          <button
            onClick={onRefresh}
            disabled={isBusy}
            className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
            title={isBusy ? 'Đang quét PR & tóm tắt…' : 'Quét lại PR & tóm tắt (⌘R)'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isBusy ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden md:inline">Quét PR</span>
          </button>

          <button
            onClick={onCopySummary}
            disabled={!canCopy || isBusy}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
              isCopied
                ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : 'border border-white/10 bg-white/[0.06] text-white/90 hover:bg-white/[0.12] hover:text-white'
            }`}
            title="Sao chép tóm tắt (⌘C)"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-sky-400" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {canReveal && (
            <button
              onClick={onRevealDestination}
              disabled={isBusy}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/15 px-2.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/25 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
              title={`Chuyển tới ${destinationLabel} trên trình duyệt (⌘P)`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{destinationLabel}</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12]"
            title="Cài đặt (⌘,)"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      }
    />
  );
}

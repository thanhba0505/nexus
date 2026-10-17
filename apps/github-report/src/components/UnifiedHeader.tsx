import {
  RefreshCw,
  Copy,
  Check,
  Settings,
  ExternalLink,
  Calendar,
  GitPullRequest,
} from 'lucide-react';
import { MiniAppHeader, AppButton, AppTabs } from '@nexus/ui';
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
            className="hidden h-7 items-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 text-[11px] text-sky-200 sm:flex"
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
      }
      rightSlot={
        <div
          data-no-drag
          data-tauri-drag-region="false"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex items-center gap-1.5"
        >
          <AppButton
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={isBusy}
            icon={RefreshCw}
            loading={isBusy}
            title={isBusy ? 'Đang quét PR & tóm tắt…' : 'Quét lại PR & tóm tắt (⌘R)'}
          >
            <span className="hidden md:inline">Quét PR</span>
          </AppButton>

          <AppButton
            size="sm"
            variant={isCopied ? 'secondary' : 'glass'}
            onClick={onCopySummary}
            disabled={!canCopy || isBusy}
            icon={isCopied ? Check : Copy}
            title="Sao chép tóm tắt (⌘C)"
          >
            {isCopied ? 'Đã chép' : 'Sao chép'}
          </AppButton>

          {canReveal && (
            <AppButton
              size="sm"
              variant="secondary"
              onClick={onRevealDestination}
              disabled={isBusy}
              icon={ExternalLink}
              title={`Chuyển tới ${destinationLabel} trên trình duyệt (⌘P)`}
            >
              {destinationLabel}
            </AppButton>
          )}

          <AppButton
            size="icon"
            variant="ghost"
            onClick={onOpenSettings}
            icon={Settings}
            title="Cài đặt (⌘,)"
          />
        </div>
      }
    />
  );
}

import React from 'react';
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
import { DateMode } from '../types';

export interface UnifiedHeaderProps {
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  prCount: number;
  commitCount: number;
  isLoading: boolean;
  isCopied: boolean;
  destinationLabel: string;
  onFetch: () => void;
  onCopySummary: () => void;
  onRevealDestination: () => void;
  onOpenSettings: () => void;
}

export function UnifiedHeader({
  dateMode,
  onDateModeChange,
  prCount,
  commitCount,
  isLoading,
  isCopied,
  destinationLabel,
  onFetch,
  onCopySummary,
  onRevealDestination,
  onOpenSettings,
}: UnifiedHeaderProps) {
  return (
    <MiniAppHeader
      leftSafeWidth={76}
      leftSlot={
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-2 text-white/90">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <GitPullRequest className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-white">GitHub Report</span>
          </div>

          {/* Badge đếm số PR & commit */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70">
            <span className="font-medium text-sky-400">{prCount}</span> PRs
            <span className="text-white/30">•</span>
            <span className="font-medium text-emerald-400">{commitCount}</span> commits
          </div>
        </div>
      }
      centerSlot={
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => onDateModeChange('today')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              dateMode === 'today'
                ? 'bg-sky-500 text-white shadow-xs font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Lấy các PR và commit từ 00:00 sáng hôm nay"
          >
            <Calendar className="w-3 h-3" />
            <span>Hôm nay</span>
          </button>
          <button
            onClick={() => onDateModeChange('last_workday')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              dateMode === 'last_workday'
                ? 'bg-sky-500 text-white shadow-xs font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="Lấy các PR và commit từ ngày làm việc gần nhất"
          >
            <span>Ngày trước</span>
          </button>
        </div>
      }
      rightSlot={
        <div className="flex items-center space-x-1.5">
          {/* Nút Fetch PRs */}
          <button
            onClick={onFetch}
            disabled={isLoading}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Quét lại GitHub PRs (⌘R)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden md:inline">Quét PR</span>
          </button>

          {/* Nút Sao chép */}
          <button
            onClick={onCopySummary}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors border border-white/10 shadow-xs cursor-pointer"
            title="Sao chép toàn bộ tóm tắt Standup (⌘C)"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-sky-400" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {/* Nút mở Parabol / Slack */}
          <button
            onClick={onRevealDestination}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white text-xs font-medium transition-colors border border-sky-500/30 cursor-pointer"
            title={`Chuyển tới tab ${destinationLabel} trên trình duyệt (⌘P)`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{destinationLabel}</span>
          </button>

          {/* Nút Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cài đặt hệ thống (⌘,)"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    />
  );
}

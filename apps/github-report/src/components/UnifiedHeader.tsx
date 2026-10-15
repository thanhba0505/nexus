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
import { getCurrentWindow } from '@tauri-apps/api/window';
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
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('button, input, select, textarea, [data-no-drag]')) {
        try {
          getCurrentWindow().startDragging();
        } catch {
          // Bỏ qua nếu chạy trên web browser
        }
      }
    }
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      className="h-13 w-full shrink-0 flex items-center justify-between px-3 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl select-none"
    >
      {/* Cụm bên trái: Chừa khoảng trống an toàn cho 3 nút Traffic Lights macOS + Tên App */}
      <div className="flex items-center space-x-3">
        {/* Padding 76px cho traffic lights */}
        <div className="w-[76px] shrink-0" aria-hidden="true" />

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

      {/* Cụm ở giữa: Bộ chọn khoảng ngày (Hôm nay / Thứ Sáu / Ngày làm việc trước) */}
      <div
        className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5"
        data-no-drag
      >
        <button
          onClick={() => onDateModeChange('today')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
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
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            dateMode === 'last_workday'
              ? 'bg-sky-500 text-white shadow-xs font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          title="Lấy công việc từ ngày làm việc gần nhất (nếu là thứ Hai sẽ lùi về thứ Sáu)"
        >
          <span>Ngày trước</span>
        </button>
      </div>

      {/* Cụm bên phải: Các nút thao tác nhanh (Fetch, Copy, Jump, Settings) */}
      <div className="flex items-center space-x-1.5" data-no-drag>
        {/* Nút Fetch (⌘R) */}
        <button
          onClick={onFetch}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 active:scale-95 transition-all text-xs font-medium disabled:opacity-50"
          title="Tải lại PR & commit từ GitHub (⌘R)"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Quét PR</span>
        </button>

        {/* Nút Copy Summary (⌘C) */}
        <button
          onClick={onCopySummary}
          disabled={commitCount === 0}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-xs font-medium disabled:opacity-40"
          title="Sao chép tóm tắt vào bộ nhớ tạm (⌘C)"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sao chép</span>
            </>
          )}
        </button>

        {/* Nút Nhảy sang Parabol / Slack */}
        <button
          onClick={onRevealDestination}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-xs"
          title={`Mở hoặc chuyển tới tab ${destinationLabel} trên trình duyệt`}
        >
          <span className="hidden lg:inline">{destinationLabel}</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/60" />
        </button>

        {/* Nút Settings (⌘,) */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Cài đặt mẫu Prompt & cấu hình (⌘,)"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

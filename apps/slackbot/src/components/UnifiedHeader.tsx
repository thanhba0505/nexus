import { MessageSquare, RefreshCw, Settings, Hash } from 'lucide-react';
import { MiniAppHeader } from '@nexus/ui';
import type { SlackStatusDto } from '../types';

export interface UnifiedHeaderProps {
  status: SlackStatusDto | null;
  isBusy: boolean;
  prefix: string;
  enablePrefix: boolean;
  allowedChannelsCount: number;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenConversations: () => void;
}

export function UnifiedHeader({
  status,
  isBusy,
  prefix,
  enablePrefix,
  allowedChannelsCount,
  onRefresh,
  onOpenSettings,
  onOpenConversations,
}: UnifiedHeaderProps) {
  const isReady = status?.hasUserToken && status?.hasAppToken;

  return (
    <MiniAppHeader
      leftSlot={
        <div data-tauri-drag-region className="flex items-center gap-2">
          <div data-tauri-drag-region className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-violet-500/30 bg-violet-500/15 text-violet-400 shadow-xs">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <span data-tauri-drag-region className="text-xs font-semibold text-white/90">
              SlackBot
            </span>
          </div>

          <div
            data-tauri-drag-region
            className="hidden h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-white/60 sm:flex"
          >
            <span className="font-medium text-violet-300">
              {enablePrefix ? prefix.trim() || '[Bot]' : 'No Prefix'}
            </span>
            <span className="text-white/20">•</span>
            <span className="font-medium tabular-nums text-white/80">{allowedChannelsCount}</span>
            <span>hội thoại</span>
          </div>
        </div>
      }
      centerSlot={
        <div
          data-no-drag
          data-tauri-drag-region="false"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/25 px-2.5 text-[11px] text-white/70"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isReady ? 'bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-amber-400'
            }`}
          />
          <span className="font-medium">
            {isReady ? 'User Account (xoxp)' : 'Chưa cấu hình Token'}
          </span>
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
            onClick={onOpenConversations}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
            title="Quản lý danh sách hội thoại cho phép"
          >
            <Hash className="h-3.5 w-3.5 text-violet-400" />
            <span className="hidden md:inline">Kênh & Hội thoại</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isBusy}
            className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
            title={isBusy ? 'Đang kiểm tra...' : 'Làm mới trạng thái (⌘R)'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isBusy ? 'animate-spin text-violet-400' : ''}`} />
            <span className="hidden lg:inline">Làm mới</span>
          </button>

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

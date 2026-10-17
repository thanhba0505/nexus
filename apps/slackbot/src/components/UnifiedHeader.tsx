import { MessageSquare, RefreshCw, Settings, Hash } from 'lucide-react';
import { MiniAppHeader, AppButton } from '@nexus/ui';
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
            className="hidden h-7 items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 text-[11px] text-violet-200 sm:flex"
          >
            <span className="font-medium text-violet-300">
              {enablePrefix ? prefix.trim() || '[Bot]' : 'No Prefix'}
            </span>
            <span className="text-violet-400/30">•</span>
            <span className="font-medium tabular-nums text-violet-100">{allowedChannelsCount}</span>
            <span>hội thoại</span>
          </div>
        </div>
      }
      centerSlot={
        <div
          data-no-drag
          data-tauri-drag-region="false"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex h-7 items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-950/40 px-2.5 text-[11px] text-violet-200"
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
          <AppButton
            size="sm"
            variant="secondary"
            onClick={onOpenConversations}
            icon={Hash}
            title="Quản lý danh sách hội thoại cho phép"
          >
            <span className="hidden md:inline">Kênh & Hội thoại</span>
          </AppButton>

          <AppButton
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={isBusy}
            icon={RefreshCw}
            loading={isBusy}
            title={isBusy ? 'Đang kiểm tra...' : 'Làm mới trạng thái (⌘R)'}
          >
            <span className="hidden lg:inline">Làm mới</span>
          </AppButton>

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

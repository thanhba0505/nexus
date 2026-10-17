import { MiniAppStatusBar } from '@nexus/ui';
import type { SlackCredentialsDto, SlackStatusDto } from '../types';

export interface StatusBarProps {
  status: SlackStatusDto | null;
  credentials: SlackCredentialsDto | null;
  isBusy: boolean;
}

function Indicator({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-white/50">
      <span className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}

export function StatusBar({ status, credentials: _credentials, isBusy }: StatusBarProps) {
  let message = 'Sẵn sàng';
  let tone: 'default' | 'busy' | 'success' | 'error' = 'default';

  if (isBusy) {
    message = 'Đang đồng bộ trạng thái...';
    tone = 'busy';
  } else if (!status?.hasUserToken || !status?.hasAppToken) {
    message = 'Chưa cấu hình đầy đủ User Token (xoxp-) và App Token (xapp-).';
    tone = 'default';
  } else if (status.isConnected) {
    message = 'Đã kết nối Socket Mode máy chủ Slack.';
    tone = 'success';
  } else {
    message = 'Sẵn sàng kết nối Socket Mode (User Token đã lưu Keychain).';
    tone = 'default';
  }

  const tokenLabel =
    status?.hasUserToken && status?.hasAppToken
      ? 'Keychain: OK'
      : status?.hasUserToken
        ? 'Thiếu App Token'
        : 'Chưa có Token';
  const tokenColor =
    status?.hasUserToken && status?.hasAppToken
      ? 'bg-emerald-400'
      : status?.hasUserToken
        ? 'bg-amber-400'
        : 'bg-rose-400';

  const aiLabel = status?.localAiEngine || (status?.localAiInstalled ? 'Local AI' : 'None');
  const aiColor = status?.localAiInstalled ? 'bg-violet-400' : 'bg-rose-400';

  return (
    <MiniAppStatusBar
      message={message}
      tone={tone}
      rightSlot={
        <div className="hidden items-center gap-3 sm:flex">
          <Indicator colorClass={tokenColor} label={tokenLabel} />
          <Indicator colorClass={aiColor} label={`AI: ${aiLabel}`} />
          <span className="text-[10px] text-white/30">v{status?.version || '0.4.0'}</span>
        </div>
      }
    />
  );
}

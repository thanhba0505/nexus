import { MiniAppStatusBar } from '@nexus/ui';
import type { ReportStatus } from '../hooks/use-github-report';
import type { PrereqStatus } from '../types';

export interface StatusBarProps {
  status: ReportStatus;
  prereqStatus: PrereqStatus | null;
}

function Indicator({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-white/50">
      <span className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}

export function StatusBar({ status, prereqStatus }: StatusBarProps) {
  const ghColor = prereqStatus?.ghLoggedIn
    ? 'bg-emerald-400'
    : prereqStatus?.ghInstalled
      ? 'bg-amber-400'
      : 'bg-rose-400';
  const ghLabel = prereqStatus?.ghLoggedIn
    ? prereqStatus.ghAccount || 'Connected'
    : prereqStatus?.ghInstalled
      ? 'Not logged in'
      : 'Missing';

  const hasAi = prereqStatus?.claudeCliInstalled || prereqStatus?.antigravityCliInstalled;
  const aiLabel = prereqStatus?.antigravityCliInstalled
    ? 'Antigravity'
    : prereqStatus?.claudeCliInstalled
      ? 'Claude'
      : 'None';

  return (
    <MiniAppStatusBar
      message={status.message}
      tone={status.tone}
      rightSlot={
        prereqStatus && (
          <div className="hidden items-center gap-3 sm:flex">
            <Indicator colorClass={ghColor} label={`gh: ${ghLabel}`} />
            <Indicator colorClass={hasAi ? 'bg-sky-400' : 'bg-rose-400'} label={`AI: ${aiLabel}`} />
          </div>
        )
      }
    />
  );
}

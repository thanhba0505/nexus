import { PrereqStatus } from '../types';

export interface StatusBarProps {
  statusText: string;
  isError: boolean;
  prereqStatus: PrereqStatus | null;
}

export function StatusBar({ statusText, isError, prereqStatus }: StatusBarProps) {
  return (
    <footer className="h-7 w-full shrink-0 flex items-center justify-between px-3 border-t border-white/10 bg-slate-950/70 backdrop-blur-md text-[11px] select-none">
      {/* Trạng thái công việc hiện tại */}
      <div className="flex items-center space-x-1.5 truncate">
        <span className={`truncate ${isError ? 'text-rose-400 font-medium' : 'text-white/60'}`}>
          {statusText || 'Sẵn sàng'}
        </span>
      </div>

      {/* Trạng thái kết nối CLI bên phải */}
      <div className="hidden sm:flex items-center space-x-3 text-[10px] text-white/50 shrink-0">
        <div className="flex items-center space-x-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              prereqStatus?.ghLoggedIn
                ? 'bg-emerald-400'
                : prereqStatus?.ghInstalled
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
            }`}
          />
          <span>
            gh:{' '}
            {prereqStatus?.ghLoggedIn
              ? prereqStatus.ghAccount || 'Connected'
              : prereqStatus?.ghInstalled
                ? 'Not logged in'
                : 'Missing'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              prereqStatus?.claudeCliInstalled || prereqStatus?.antigravityCliInstalled
                ? 'bg-sky-400'
                : 'bg-rose-400'
            }`}
          />
          <span>
            AI:{' '}
            {prereqStatus?.antigravityCliInstalled
              ? 'Antigravity'
              : prereqStatus?.claudeCliInstalled
                ? 'Claude'
                : 'None'}
          </span>
        </div>
      </div>
    </footer>
  );
}

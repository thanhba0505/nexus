import { GitPullRequest, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export interface InitStepItem {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export interface AppSplashScreenProps {
  progress: number;
  currentMessage: string;
  steps: InitStepItem[];
  isExiting: boolean;
}

export function AppSplashScreen({
  progress,
  currentMessage,
  steps,
  isExiting,
}: AppSplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col select-none transition-all duration-500 ease-out bg-slate-950/90 backdrop-blur-2xl ${
        isExiting ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Drag region for macOS window */}
      <div className="h-10 w-full" data-tauri-drag-region />

      {/* Main content centered */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-8">
        {/* Glowing Logo Card */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl blur-xl opacity-40 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/15 shadow-2xl flex items-center justify-center">
            <GitPullRequest className="w-10 h-10 text-sky-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
              <Sparkles
                className="w-3.5 h-3.5 text-indigo-300 animate-spin"
                style={{ animationDuration: '4s' }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          GitHub Report
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
            v0.4.0
          </span>
        </h1>
        <p className="text-xs text-white/50 mt-1 mb-8">
          Khởi tạo môi trường & nạp cấu hình hệ thống
        </p>

        {/* Progress Card */}
        <div className="w-full max-w-sm rounded-2xl bg-white/[0.04] border border-white/10 p-5 shadow-inner backdrop-blur-md">
          {/* Step list */}
          <div className="space-y-3 mb-5 text-xs">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span
                  className={
                    s.status === 'done'
                      ? 'text-white/90'
                      : s.status === 'running'
                        ? 'text-sky-300 font-medium'
                        : 'text-white/40'
                  }
                >
                  {s.label}
                </span>
                <span className="flex items-center">
                  {s.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : s.status === 'running' ? (
                    <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/10 mb-2.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-300 ease-out shadow-sm shadow-sky-500/50"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span className="truncate pr-2">{currentMessage}</span>
            <span className="font-mono text-white/70">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="h-10 flex items-center justify-center text-[10px] text-white/30 tracking-wider uppercase font-medium">
        Nexus Ecosystem • Local First
      </div>
    </div>
  );
}

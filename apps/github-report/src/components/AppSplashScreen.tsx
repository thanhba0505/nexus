import { GitPullRequest, Sparkles } from 'lucide-react';

export interface AppSplashScreenProps {
  progress: number;
  message?: string;
  isExiting: boolean;
}

export function AppSplashScreen({
  progress,
  message = 'Đang khởi động...',
  isExiting,
}: AppSplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col select-none transition-all duration-400 ease-out bg-slate-950/95 backdrop-blur-2xl ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Vùng kéo cửa sổ macOS */}
      <div className="h-10 w-full shrink-0" data-tauri-drag-region />

      {/* Nội dung trung tâm: Icon app & thanh tiến trình */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-8">
        {/* Glowing App Icon */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl blur-2xl opacity-50 animate-pulse" />
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

        {/* Tên ứng dụng */}
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-6">
          GitHub Report
        </h1>

        {/* Thanh tiến trình (Progress Bar) */}
        <div className="w-64 max-w-xs space-y-2">
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 transition-all duration-300 ease-out shadow-sm shadow-sky-500/50"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <span className="truncate pr-2">{message}</span>
            <span className="font-mono text-white/60 shrink-0">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

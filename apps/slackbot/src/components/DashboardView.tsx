import {
  Key,
  ShieldCheck,
  Bot,
  UserCheck,
  Hash,
  ExternalLink,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { SlackAppSettings, SlackCredentialsDto, SlackStatusDto } from '../types';

export interface DashboardViewProps {
  settings: SlackAppSettings;
  status: SlackStatusDto | null;
  credentials: SlackCredentialsDto | null;
  onOpenSettings: () => void;
  onOpenConversations: () => void;
}

export function DashboardView({
  settings,
  status,
  credentials,
  onOpenSettings,
  onOpenConversations,
}: DashboardViewProps) {
  const isReady = status?.hasUserToken && status?.hasAppToken;
  const activeConversations = settings.conversations.filter((c) => c.enabled);

  return (
    <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 select-none text-xs">
      {/* Banner Trạng Thái Danh Tính & Token */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-purple-950/20 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/20 text-violet-300 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white/95">
                  Tài Khoản Cá Nhân Ủy Quyền (User Account)
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                  <UserCheck className="h-3 w-3" />
                  xoxp- mode
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                Giao tiếp trực tiếp dưới danh xưng cá nhân, bảo đảm minh bạch bằng tiền tố nhận
                diện.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isReady ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-emerald-300 text-[11px] font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Tokens Đã Sẵn Sàng</span>
              </div>
            ) : (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-amber-300 text-[11px] font-medium hover:bg-amber-500/25 transition-colors"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Cấu hình Token ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Prefix Preview Card */}
        <div className="mt-3.5 rounded-xl border border-white/[0.08] bg-black/40 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Bản Xem Trước Tin Nhắn Trên Slack (Message Prefix Engine)
            </span>
            <span className="text-[10px] text-violet-400 font-mono">
              Prefix: {settings.identity.enablePrefix ? settings.identity.defaultPrefix : 'Tắt'}
            </span>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] p-2.5 border border-white/[0.04]">
            <div className="h-7 w-7 rounded-md bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 font-semibold text-xs shrink-0">
              U
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white/90 text-xs">
                  {settings.persona.displayName || 'Bạn (AI Dispatcher)'}
                </span>
                <span className="text-[10px] text-white/40">11:00 AM</span>
              </div>
              <p className="text-white/80 text-xs mt-0.5 leading-relaxed font-sans">
                {settings.identity.enablePrefix && (
                  <strong className="text-violet-400 font-mono">
                    {settings.identity.defaultPrefix}
                  </strong>
                )}
                Xin chào team! Mình đã rà soát pull request và kiểm thử cục bộ thành công. Các thay
                đổi đã sẵn sàng để merge.
              </p>
              {settings.persona.signature && (
                <p className="text-[11px] text-white/40 italic mt-1">
                  {settings.persona.signature}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3 Cột: Socket Mode, Loop Guard, Cross-App Bridge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Socket Mode Status */}
        <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                <span>Socket Mode Client</span>
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  credentials?.hasAppToken ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            </div>
            <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
              Duy trì kết nối WebSocket thời gian thực hai chiều bảo mật sau tường lửa nội bộ qua
              App Token.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-white/40">App Token:</span>
            <span className="font-mono text-white/80">
              {credentials?.hasAppToken ? credentials.maskedAppToken : 'Chưa lưu'}
            </span>
          </div>
        </div>

        {/* Card 2: 3-Layer Loop Guard */}
        <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Loop Prevention Guard</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
            </div>
            <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
              Kiến trúc 3 lớp chống tự lặp vô tận: lọc ID người gửi, đối chiếu tiền tố và lưu LRU
              100 tin nhắn gửi đi.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-white/40">Kênh Whitelist:</span>
            <span className="font-medium text-violet-300">
              {activeConversations.length} kênh kích hoạt
            </span>
          </div>
        </div>

        {/* Card 3: Cross-App Standup Bridge */}
        <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-sky-400" />
                <span>Standup Bridge</span>
              </span>
              <span className="text-[10px] text-sky-400 font-semibold">Ready</span>
            </div>
            <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
              Sẵn sàng tiếp nhận bản tóm tắt Daily Standup từ GitHub Report để đẩy vào kênh Slack
              định sẵn.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-white/40">Local AI Engine:</span>
            <span className="font-medium text-violet-300">
              {status?.localAiEngine || 'Claude/Antigravity'}
            </span>
          </div>
        </div>
      </div>

      {/* Allowed Conversations Overview Table */}
      <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5 backdrop-blur-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-violet-400" />
              <span>
                Danh Sách Hội Thoại Được Phép Phản Hồi ({activeConversations.length} đang bật)
              </span>
            </h3>
            <p className="text-[11px] text-white/50">
              Bot chỉ hoạt động trong các kênh được liệt kê bên dưới theo chế độ tương ứng.
            </p>
          </div>

          <button
            onClick={onOpenConversations}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-medium transition-colors"
          >
            <span>Quản lý Whitelist</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {settings.conversations.map((c) => (
            <div
              key={c.conversationId}
              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                c.enabled
                  ? 'bg-white/[0.02] border-white/[0.06]'
                  : 'bg-black/20 border-white/[0.03] opacity-40'
              }`}
            >
              <div className="min-w-0 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-white/90 text-[11px] truncate">{c.name}</div>
                  <div className="text-[10px] text-white/40 font-mono truncate">
                    {c.conversationId}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.04] text-violet-300 border border-white/[0.06]">
                  {c.customPrefix || settings.identity.defaultPrefix}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                    c.mode === 'draft_review'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                  }`}
                >
                  {c.mode === 'draft_review' ? 'Draft' : 'Auto'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

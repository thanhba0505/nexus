import {
  Key,
  ShieldCheck,
  Bot,
  UserCheck,
  Hash,
  ExternalLink,
  GitPullRequest,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { ContentCard, AppButton } from '@nexus/ui';
import type { SlackAppSettings, SlackCredentialsDto, SlackStatusDto } from '../types';

export interface DashboardViewProps {
  settings: SlackAppSettings;
  status: SlackStatusDto | null;
  credentials: SlackCredentialsDto | null;
  activeTab?: 'overview' | 'conversations';
  onTabChange?: (tab: 'overview' | 'conversations') => void;
  onOpenSettings: () => void;
  onOpenConversations: () => void;
}

export function DashboardView({
  settings,
  status,
  credentials,
  activeTab = 'overview',
  onTabChange,
  onOpenSettings,
  onOpenConversations,
}: DashboardViewProps) {
  const isReady = status?.hasUserToken && status?.hasAppToken;
  const activeConversations = settings.conversations.filter((c) => c.enabled);

  return (
    <div className="space-y-4 select-none text-xs">
      {activeTab === 'overview' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {!isReady && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Chưa cấu hình đầy đủ User Token (xoxp-) và App Token (xapp-).</span>
              </div>
              <AppButton
                size="sm"
                variant="secondary"
                onClick={onOpenSettings}
                className="text-amber-300 border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25"
              >
                Cấu hình Token ngay
              </AppButton>
            </div>
          )}

          {/* Banner Trạng Thái Danh Tính & Token */}
          <ContentCard variant="acrylic" padding="md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
            </div>

            {/* Live Prefix Preview Card */}
            <div className="mt-4 rounded-xl border border-violet-500/25 bg-black/40 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                  Bản Xem Trước Tin Nhắn Trên Slack (Message Prefix Engine)
                </span>
                <span className="text-[10px] text-violet-300 font-mono">
                  Prefix: {settings.identity.enablePrefix ? settings.identity.defaultPrefix : 'Tắt'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg bg-violet-500/[0.04] p-3 border border-violet-500/20">
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
                  <p className="text-white/80 text-xs mt-1 leading-relaxed font-sans">
                    {settings.identity.enablePrefix && (
                      <strong className="text-violet-400 font-mono mr-1">
                        {settings.identity.defaultPrefix}
                      </strong>
                    )}
                    Xin chào team! Mình đã rà soát pull request và kiểm thử cục bộ thành công. Các
                    thay đổi đã sẵn sàng để merge.
                  </p>
                  {settings.persona.signature && (
                    <p className="text-[11px] text-white/40 italic mt-1.5">
                      {settings.persona.signature}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ContentCard>

          {/* Grid 3 Cột: Socket Mode, Loop Guard, Cross-App Bridge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Socket Mode Status */}
            <ContentCard
              title="Socket Mode Client"
              icon={Key}
              badge={
                <span
                  className={`h-2 w-2 rounded-full ${
                    credentials?.hasAppToken ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
              }
              variant="subtle"
              padding="sm"
            >
              <p className="text-[11px] text-white/50 leading-relaxed min-h-[44px]">
                Duy trì kết nối WebSocket thời gian thực hai chiều bảo mật sau tường lửa nội bộ qua
                App Token.
              </p>
              <div className="mt-3 pt-2 border-t border-violet-500/20 flex items-center justify-between text-[11px]">
                <span className="text-white/40">App Token:</span>
                <span className="font-mono text-white/80">
                  {credentials?.hasAppToken ? credentials.maskedAppToken : 'Chưa lưu'}
                </span>
              </div>
            </ContentCard>

            {/* Card 2: 3-Layer Loop Guard */}
            <ContentCard
              title="Loop Prevention Guard"
              icon={ShieldCheck}
              badge={<span className="text-[10px] text-emerald-400 font-semibold">Active</span>}
              variant="subtle"
              padding="sm"
            >
              <p className="text-[11px] text-white/50 leading-relaxed min-h-[44px]">
                Kiến trúc 3 lớp chống tự lặp vô tận: lọc ID người gửi, đối chiếu tiền tố và lưu LRU
                100 tin nhắn.
              </p>
              <div className="mt-3 pt-2 border-t border-violet-500/20 flex items-center justify-between text-[11px]">
                <span className="text-white/40">Kênh Whitelist:</span>
                <span className="font-medium text-violet-300">
                  {activeConversations.length} kênh kích hoạt
                </span>
              </div>
            </ContentCard>

            {/* Card 3: Cross-App Standup Bridge */}
            <ContentCard
              title="Standup Bridge"
              icon={GitPullRequest}
              badge={<span className="text-[10px] text-sky-400 font-semibold">Ready</span>}
              variant="subtle"
              padding="sm"
            >
              <p className="text-[11px] text-white/50 leading-relaxed min-h-[44px]">
                Sẵn sàng tiếp nhận bản tóm tắt Daily Standup từ GitHub Report để đẩy vào kênh Slack
                định sẵn.
              </p>
              <div className="mt-3 pt-2 border-t border-violet-500/20 flex items-center justify-between text-[11px]">
                <span className="text-white/40">Local AI Engine:</span>
                <span className="font-medium text-violet-300">
                  {status?.localAiEngine || 'Claude/Antigravity'}
                </span>
              </div>
            </ContentCard>
          </div>

          {/* Allowed Conversations Overview */}
          <ContentCard
            title={`Danh Sách Hội Thoại Được Phép Phản Hồi (${activeConversations.length} đang bật)`}
            icon={Hash}
            actions={
              <AppButton
                size="sm"
                variant="secondary"
                icon={ExternalLink}
                onClick={onOpenConversations}
              >
                Quản lý Whitelist
              </AppButton>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {settings.conversations.slice(0, 4).map((c) => (
                <div
                  key={c.conversationId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                    c.enabled
                      ? 'bg-violet-500/[0.04] border-violet-500/20 hover:border-violet-500/35'
                      : 'bg-black/20 border-violet-500/10 opacity-40'
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
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/25">
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
            {settings.conversations.length > 4 && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => onTabChange?.('conversations')}
                  className="text-[11px] text-violet-300 hover:text-white transition-colors"
                >
                  + Xem thêm {settings.conversations.length - 4} hội thoại khác...
                </button>
              </div>
            )}
          </ContentCard>
        </div>
      ) : (
        /* CONVERSATIONS TAB VIEW */
        <div className="space-y-4 animate-in fade-in duration-150">
          <ContentCard
            title="Quản Lý Whitelist Kênh & Hội Thoại"
            icon={Hash}
            actions={
              <AppButton size="sm" variant="primary" icon={Plus} onClick={onOpenConversations}>
                Chỉnh sửa Whitelist
              </AppButton>
            }
          >
            <p className="text-xs text-white/60 mb-3">
              SlackBot chỉ lắng nghe và tạo phản hồi trong các kênh và nhóm chat dưới đây. Chế độ
              "Draft" yêu cầu bạn xác nhận trước khi gửi, trong khi "Auto" sẽ phản hồi trực tiếp.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {settings.conversations.map((c) => (
                <div
                  key={c.conversationId}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                    c.enabled
                      ? 'bg-violet-500/[0.04] border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/[0.08]'
                      : 'bg-black/20 border-violet-500/10 opacity-40'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300 shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-white/95 text-xs truncate">{c.name}</div>
                      <div className="text-[10px] text-white/40 font-mono truncate">
                        ID: {c.conversationId}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        c.mode === 'draft_review'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {c.mode === 'draft_review' ? 'Draft Review' : 'Auto Dispatch'}
                    </span>
                    <span className="text-[10px] font-mono text-violet-300/80">
                      {c.customPrefix || settings.identity.defaultPrefix}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>
      )}
    </div>
  );
}

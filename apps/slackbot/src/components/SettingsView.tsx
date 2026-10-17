import { useState } from 'react';
import {
  Sparkles,
  Key,
  ShieldCheck,
  Check,
  User,
  Info,
  Trash2,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';
import {
  ContentCard,
  AppButton,
  AppSelect,
  AppSelectOption,
  AppInput,
  AppTextarea,
} from '@nexus/ui';
import type {
  AIConfig,
  PersonaConfig,
  SlackAppSettings,
  SlackCredentialsDto,
  SlackStatusDto,
} from '../types';

const AI_PROVIDER_OPTIONS: AppSelectOption<AIConfig['provider']>[] = [
  { value: 'auto', label: 'Tự động (Ưu tiên Claude CLI / Antigravity CLI)' },
  { value: 'claude', label: 'Claude Code CLI (claude -p)' },
  { value: 'agy', label: 'Antigravity CLI (agy -p)' },
  { value: 'cloud', label: 'Cloud AI (Dự phòng)' },
];

const TONE_OPTIONS: AppSelectOption<PersonaConfig['tone']>[] = [
  { value: 'professional_friendly', label: 'Chuyên nghiệp & Thân thiện' },
  { value: 'professional_technical', label: 'Kỹ thuật & Chuẩn xác' },
  { value: 'concise', label: 'Ngắn gọn, súc tích' },
  { value: 'friendly', label: 'Thân mật, cởi mở' },
];

const PRONOUN_OPTIONS: AppSelectOption<PersonaConfig['pronoun']>[] = [
  { value: 'mình_bạn', label: 'mình / bạn' },
  { value: 'em_anh', label: 'em / anh, chị' },
  { value: 'tôi_bạn', label: 'tôi / bạn' },
  { value: 'mình_các_bạn', label: 'mình / các bạn' },
];

export interface SettingsViewProps {
  settings: SlackAppSettings;
  credentials: SlackCredentialsDto | null;
  status: SlackStatusDto | null;
  onSaveSettings: (newSettings: SlackAppSettings) => Promise<void> | void;
  onSaveCredentials: (userToken: string, appToken: string) => Promise<void>;
  onDeleteCredentials: () => Promise<void>;
}

export function SettingsView({
  settings,
  credentials,
  status: _status,
  onSaveSettings,
  onSaveCredentials,
  onDeleteCredentials,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'identity' | 'ai' | 'security'>('identity');
  const [formData, setFormData] = useState<SlackAppSettings>(settings);
  const [userTokenInput, setUserTokenInput] = useState('');
  const [appTokenInput, setAppTokenInput] = useState('');
  const [showTokens, setShowTokens] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeletingCredentials, setIsDeletingCredentials] = useState(false);

  const handleSaveAll = async () => {
    if (userTokenInput.trim() || appTokenInput.trim()) {
      await onSaveCredentials(userTokenInput.trim(), appTokenInput.trim());
      setUserTokenInput('');
      setAppTokenInput('');
    }
    await onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveCredentialsOnly = async () => {
    if (userTokenInput.trim() || appTokenInput.trim()) {
      await onSaveCredentials(userTokenInput.trim(), appTokenInput.trim());
      setUserTokenInput('');
      setAppTokenInput('');
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2500);
    }
  };

  const handleDeleteTokens = async () => {
    if (window.confirm('Bạn có chắc muốn xoá các Token đã lưu trong macOS Keychain không?')) {
      setIsDeletingCredentials(true);
      try {
        await onDeleteCredentials();
      } finally {
        setIsDeletingCredentials(false);
      }
    }
  };

  return (
    <ContentCard
      title="Cấu Hình & Cài Đặt SlackBot"
      subtitle="Quản lý User Token (xoxp-), Socket Mode (xapp-), AI Persona và Loop Guard"
      icon={Settings}
      actions={
        <AppButton size="sm" variant="primary" onClick={handleSaveAll} icon={Check}>
          {isSaved ? 'Đã lưu cài đặt' : 'Lưu thay đổi'}
        </AppButton>
      }
      variant="acrylic"
      padding="md"
      className="space-y-4"
    >
      {/* Segmented Control Tabs */}
      <div className="flex rounded-lg bg-black/30 p-0.5 border border-violet-500/20 gap-1">
        <button
          onClick={() => setActiveTab('identity')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
            activeTab === 'identity'
              ? 'bg-violet-500/20 text-violet-200 font-medium shadow-xs border border-violet-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-violet-400" />
          <span>Token & Danh Tính</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
            activeTab === 'ai'
              ? 'bg-violet-500/20 text-violet-200 font-medium shadow-xs border border-violet-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>AI & Persona</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
            activeTab === 'security'
              ? 'bg-violet-500/20 text-violet-200 font-medium shadow-xs border border-violet-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
          <span>Loop Guard & Bảo Mật</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 text-xs">
        {activeTab === 'identity' && (
          <div className="space-y-4">
            {/* Alert Callout: User Token Strategy */}
            <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-200/90 flex gap-2.5">
              <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white/90">Chiến lược User Token (xoxp-)</p>
                <p className="text-[11px] leading-relaxed text-violet-200/80">
                  SlackBot sử dụng <strong>User Account Token (xoxp-)</strong> ủy quyền gửi tin nhắn
                  trực tiếp dưới danh xưng tài khoản của bạn, kết hợp cùng{' '}
                  <strong>App Token (xapp-)</strong> để duy trì Socket Mode sau firewall.
                </p>
              </div>
            </div>

            {/* User Account Token (xoxp-) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-white/80 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  <span>User OAuth Token (xoxp-...)</span>
                </label>
                {credentials?.hasUserToken && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Keychain: {credentials.maskedUserToken || 'Đã lưu'}
                  </span>
                )}
              </div>
              <AppInput
                type={showTokens ? 'text' : 'password'}
                value={userTokenInput}
                onChange={(e) => setUserTokenInput(e.target.value)}
                placeholder={
                  credentials?.hasUserToken
                    ? 'Nhập mã mới để ghi đè (xoxp-...)'
                    : 'xoxp-your-user-token'
                }
                inputClassName="font-mono"
              />
            </div>

            {/* App-Level Token (xapp-) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-white/80 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-violet-400" />
                  <span>App-Level Token (xapp-... cho Socket Mode)</span>
                </label>
                {credentials?.hasAppToken && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Keychain: {credentials.maskedAppToken || 'Đã lưu'}
                  </span>
                )}
              </div>
              <AppInput
                type={showTokens ? 'text' : 'password'}
                value={appTokenInput}
                onChange={(e) => setAppTokenInput(e.target.value)}
                placeholder={
                  credentials?.hasAppToken
                    ? 'Nhập mã mới để ghi đè (xapp-...)'
                    : 'xapp-your-app-token'
                }
                inputClassName="font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowTokens(!showTokens)}
                className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80 transition-colors"
              >
                {showTokens ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showTokens ? 'Ẩn Token' : 'Hiện Token'}</span>
              </button>

              {(userTokenInput.trim() || appTokenInput.trim()) && (
                <button
                  type="button"
                  onClick={handleSaveCredentialsOnly}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs hover:bg-violet-600/50 transition-colors"
                >
                  {tokenSaved ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Đã lưu Keychain!</span>
                    </>
                  ) : (
                    <span>Lưu Token vào Keychain</span>
                  )}
                </button>
              )}
            </div>

            {/* Message Prefix Settings */}
            <div className="p-3.5 rounded-xl bg-violet-500/[0.04] border border-violet-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white/90">Tiền tố nhận diện ([Bot])</h4>
                  <p className="text-[11px] text-white/50">
                    Tự động chèn tiền tố vào tin nhắn để thông báo phản hồi được AI soạn thảo.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.identity.enablePrefix}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identity: { ...formData.identity, enablePrefix: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded border-violet-500/35 bg-black/40 text-violet-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {formData.identity.enablePrefix && (
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <AppInput
                      size="sm"
                      value={formData.identity.defaultPrefix}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity: { ...formData.identity, defaultPrefix: e.target.value },
                        })
                      }
                      placeholder="[Bot] "
                      inputClassName="font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-white/50 font-mono">
                    Xem trước:{' '}
                    <span className="text-violet-300">
                      {formData.identity.defaultPrefix}Chào team, mình đã fix xong issue.
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/80">AI Provider Ưu Tiên</label>
              <AppSelect
                value={formData.ai.provider}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    ai: { ...formData.ai, provider: val as AIConfig['provider'] },
                  })
                }
                options={AI_PROVIDER_OPTIONS}
              />
            </div>

            {/* Persona Tone & Pronoun */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/80">Giọng điệu (Tone)</label>
                <AppSelect
                  value={formData.persona.tone}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      persona: {
                        ...formData.persona,
                        tone: val as PersonaConfig['tone'],
                      },
                    })
                  }
                  options={TONE_OPTIONS}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/80">Danh xưng xưng hô</label>
                <AppSelect
                  value={formData.persona.pronoun}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      persona: {
                        ...formData.persona,
                        pronoun: val as PersonaConfig['pronoun'],
                      },
                    })
                  }
                  options={PRONOUN_OPTIONS}
                />
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-1.5">
              <AppInput
                label="Chữ ký cuối tin nhắn"
                value={formData.persona.signature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    persona: { ...formData.persona, signature: e.target.value },
                  })
                }
                placeholder="— _Soạn tự động bởi SlackBot_"
                inputClassName="font-mono"
              />
            </div>

            {/* System Prompt */}
            <div className="space-y-1.5">
              <AppTextarea
                label="Chỉ dẫn hệ thống (System Prompt)"
                rows={4}
                value={formData.ai.systemPrompt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ai: { ...formData.ai, systemPrompt: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Loop Prevention Architecture */}
            <div className="p-3.5 rounded-xl bg-violet-500/[0.04] border border-violet-500/20 space-y-3">
              <h4 className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>3-Layer Loop Prevention Guard</span>
              </h4>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Ngăn chặn vòng lặp chat vô tận khi bot gửi tin bằng User Token của chính bạn:
              </p>

              <div className="space-y-2 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.loopPrevention.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loopPrevention: {
                          ...formData.loopPrevention,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-violet-500/35 bg-black/40 text-violet-500 focus:ring-0"
                  />
                  <span className="text-white/80">Bật cơ chế chống lặp (Loop Guard Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.loopPrevention.filterSelfPrefix}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loopPrevention: {
                          ...formData.loopPrevention,
                          filterSelfPrefix: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-violet-500/35 bg-black/40 text-violet-500 focus:ring-0"
                  />
                  <span className="text-white/80">
                    Tự động DROP tin nhắn do chính bạn gửi bắt đầu bằng tiền tố bot
                  </span>
                </label>
              </div>

              <div className="pt-2 text-[11px] text-white/50 flex items-center justify-between border-t border-violet-500/20">
                <span>LRU Message ID Cache Size:</span>
                <span className="font-mono text-violet-300">
                  {formData.loopPrevention.lruCacheSize} IDs gần nhất
                </span>
              </div>
            </div>

            {/* Keychain Management */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2.5">
              <h4 className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quản lý Keychain Tokens</span>
              </h4>
              <p className="text-[11px] text-rose-200/70">
                Xoá User Token và App Token được mã hóa trong macOS Keychain. Bạn sẽ cần nhập lại
                token để kết nối SlackBot.
              </p>
              <button
                type="button"
                disabled={
                  isDeletingCredentials || (!credentials?.hasUserToken && !credentials?.hasAppToken)
                }
                onClick={handleDeleteTokens}
                className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeletingCredentials ? 'Đang xoá...' : 'Xoá Token khỏi Keychain'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ContentCard>
  );
}

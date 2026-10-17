import { useState } from 'react';
import {
  Sparkles,
  Compass,
  ShieldCheck,
  Check,
  RotateCcw,
  Key,
  Terminal,
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
import { AppSettings, PrereqStatus } from '../types';
import { DEFAULT_PROMPT } from '../services/storage';

const AI_PROVIDER_OPTIONS: AppSelectOption<'auto' | 'claude' | 'agy'>[] = [
  { value: 'auto', label: 'Tự động (Ưu tiên Claude Code CLI → Antigravity CLI)' },
  { value: 'claude', label: 'Claude Code CLI (claude -p)' },
  { value: 'agy', label: 'Antigravity CLI (agy -p)' },
];

const DESTINATION_OPTIONS: AppSelectOption<'parabol' | 'slack' | 'copy_only'>[] = [
  { value: 'parabol', label: 'Parabol (Mở tab parabol.co và tự kích hoạt)' },
  { value: 'slack', label: 'Slack Web / App' },
  { value: 'copy_only', label: 'Chỉ sao chép vào Clipboard (Không mở trình duyệt)' },
];

const BROWSER_OPTIONS: AppSelectOption<'Brave Browser' | 'Google Chrome' | 'Arc' | 'Safari'>[] = [
  { value: 'Brave Browser', label: 'Brave Browser' },
  { value: 'Google Chrome', label: 'Google Chrome' },
  { value: 'Arc', label: 'Arc Browser' },
  { value: 'Safari', label: 'Safari' },
];

export interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  prereqStatus: PrereqStatus | null;
  onSaveToken: (token: string) => Promise<void>;
}

export function SettingsView({
  settings,
  onSaveSettings,
  prereqStatus,
  onSaveToken,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'workflow' | 'system'>('ai');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveTokenClick = async () => {
    if (tokenInput.trim()) {
      await onSaveToken(tokenInput.trim());
      setTokenSaved(true);
      setTokenInput('');
      setTimeout(() => setTokenSaved(false), 2500);
    }
  };

  return (
    <ContentCard
      title="Cấu Hình & Cài Đặt GitHub Report"
      subtitle="Quản lý kết nối AI Provider, quy trình sao chép và bảo mật Keychain"
      icon={Settings}
      actions={
        <AppButton size="sm" variant="primary" onClick={handleSave} icon={Check}>
          {isSaved ? 'Đã lưu cài đặt' : 'Lưu thay đổi'}
        </AppButton>
      }
      variant="acrylic"
      padding="md"
      className="space-y-4"
    >
      {/* Tab Navigation (macOS Segmented Control) */}
      <div className="flex rounded-lg bg-black/30 p-0.5 border border-sky-500/20 gap-1">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
            activeTab === 'ai'
              ? 'bg-sky-500/20 text-sky-200 font-medium shadow-xs border border-sky-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>AI & Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
            activeTab === 'workflow'
              ? 'bg-sky-500/20 text-sky-200 font-medium shadow-xs border border-sky-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>Quy trình & Đích đến</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
            activeTab === 'system'
              ? 'bg-sky-500/20 text-sky-200 font-medium shadow-xs border border-sky-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Hệ thống & Bảo mật</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2 text-xs">
        {activeTab === 'ai' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-white/80 font-medium mb-1">AI Provider ưu tiên</label>
              <AppSelect
                value={formData.ai.provider}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    ai: { ...formData.ai, provider: val as 'auto' | 'claude' | 'agy' },
                  })
                }
                options={AI_PROVIDER_OPTIONS}
              />
              <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                Sử dụng session đăng nhập CLI có sẵn trên máy Mac, hoàn toàn không tốn token cost.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-white/80 font-medium">Mẫu Prompt Tóm Tắt</label>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, promptTemplate: DEFAULT_PROMPT },
                    })
                  }
                  className="flex items-center gap-1 text-[11px] text-sky-400/80 hover:text-sky-300 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Mặc định</span>
                </button>
              </div>
              <AppTextarea
                value={formData.ai.promptTemplate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ai: { ...formData.ai, promptTemplate: e.target.value },
                  })
                }
                rows={5}
                textareaClassName="font-mono text-[11px] leading-relaxed resize-none"
              />
            </div>

            <div>
              <AppInput
                label="Chỉ Dẫn Nghiệp Vụ Bổ Sung"
                type="text"
                value={formData.ai.customInstructions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ai: { ...formData.ai, customInstructions: e.target.value },
                  })
                }
                placeholder="Ví dụ: Tập trung vào kết quả bàn giao, bỏ qua các commit merge…"
              />
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-white/80 font-medium mb-1">Đích Đến Mặc Định</label>
              <AppSelect
                value={formData.workflow.destination}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    workflow: {
                      ...formData.workflow,
                      destination: val as 'parabol' | 'slack' | 'copy_only',
                    },
                  })
                }
                options={DESTINATION_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-1">Trình Duyệt Ưu Tiên</label>
              <AppSelect
                value={formData.workflow.browser}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    workflow: {
                      ...formData.workflow,
                      browser: val as 'Brave Browser' | 'Google Chrome' | 'Arc' | 'Safari',
                    },
                  })
                }
                options={BROWSER_OPTIONS}
              />
              <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                Ứng dụng sẽ tìm tab Parabol đang mở trên trình duyệt này bằng AppleScript để chuyển
                tới ngay lập tức.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-sky-500/20">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.workflow.autoCopy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workflow: { ...formData.workflow, autoCopy: e.target.checked },
                    })
                  }
                  className="h-3.5 w-3.5 rounded border-sky-500/35 text-sky-500 focus:ring-0 bg-black/40 cursor-pointer"
                />
                <span className="text-white/80 font-normal select-none">
                  Tự động sao chép vào Clipboard khi tóm tắt xong
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.workflow.revealBrowser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workflow: { ...formData.workflow, revealBrowser: e.target.checked },
                    })
                  }
                  className="h-3.5 w-3.5 rounded border-sky-500/35 text-sky-500 focus:ring-0 bg-black/40 cursor-pointer"
                />
                <span className="text-white/80 font-normal select-none">
                  Tự động kích hoạt tab trình duyệt khi có kết quả
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-3.5">
            {/* Trạng thái CLIs */}
            <div className="p-3 rounded-lg bg-black/25 border border-sky-500/20 space-y-2">
              <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                Trạng Thái Công Cụ Hệ Thống
              </h4>

              <div className="flex items-center justify-between py-1 border-b border-sky-500/15">
                <span className="text-white/80 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>GitHub CLI (`gh`)</span>
                </span>
                <span className="font-medium text-emerald-400 text-[11px]">
                  {prereqStatus?.ghLoggedIn
                    ? `Đã đăng nhập (${prereqStatus.ghAccount || '@me'})`
                    : prereqStatus?.ghInstalled
                      ? 'Chưa đăng nhập (`gh auth login`)'
                      : 'Chưa cài đặt'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-sky-500/15">
                <span className="text-white/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Claude Code CLI (`claude`)</span>
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    prereqStatus?.claudeCliInstalled ? 'text-emerald-400' : 'text-white/40'
                  }`}
                >
                  {prereqStatus?.claudeCliInstalled ? 'Khả dụng ✓' : 'Chưa cài đặt'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-white/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Antigravity CLI (`agy`)</span>
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    prereqStatus?.antigravityCliInstalled ? 'text-emerald-400' : 'text-white/40'
                  }`}
                >
                  {prereqStatus?.antigravityCliInstalled ? 'Khả dụng ✓' : 'Chưa cài đặt'}
                </span>
              </div>
            </div>

            {/* Dự phòng GitHub Token vào Keychain */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-white/80 font-medium">
                GitHub Personal Access Token (Dự phòng cho máy chưa cài `gh`)
              </label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <AppInput
                    leadingIcon={Key}
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    inputClassName="font-mono text-[11px]"
                    size="sm"
                  />
                </div>
                <AppButton
                  onClick={handleSaveTokenClick}
                  disabled={!tokenInput.trim()}
                  variant="primary"
                  size="sm"
                >
                  {tokenSaved ? 'Đã lưu' : 'Lưu Keychain'}
                </AppButton>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">
                {prereqStatus?.hasGithubToken
                  ? '✓ Đã có GitHub Token được lưu an toàn trong macOS Keychain.'
                  : 'Token được bảo vệ trong macOS Keychain (Apple Secure Enclave).'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ContentCard>
  );
}

import { useState } from 'react';
import { X, Sparkles, Compass, ShieldCheck, Check, RotateCcw, Key, Terminal } from 'lucide-react';
import { AppSettings, PrereqStatus } from '../types';
import { DEFAULT_PROMPT } from '../services/storage';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  prereqStatus: PrereqStatus | null;
  onSaveToken: (token: string) => Promise<void>;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  prereqStatus,
  onSaveToken,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'workflow' | 'system'>('ai');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header của Modal */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] shrink-0">
          <h3 className="text-xs font-semibold text-white/90">Cài đặt GitHub Report</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Navigation (macOS Segmented Control) */}
        <div className="px-5 pt-3 shrink-0">
          <div className="flex rounded-lg bg-black/30 p-0.5 border border-white/[0.06] gap-1">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs transition-all ${
                activeTab === 'ai'
                  ? 'bg-white/10 text-white font-medium shadow-xs'
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
                  ? 'bg-white/10 text-white font-medium shadow-xs'
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
                  ? 'bg-white/10 text-white font-medium shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Hệ thống & Bảo mật</span>
            </button>
          </div>
        </div>

        {/* Nội dung Tab */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 text-xs">
          {activeTab === 'ai' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-white/80 font-medium mb-1">AI Provider ưu tiên</label>
                <select
                  value={formData.ai.provider}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, provider: e.target.value as 'auto' | 'claude' | 'agy' },
                    })
                  }
                  className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white/90 text-xs focus:outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/40 transition-colors"
                >
                  <option value="auto">Tự động (Ưu tiên Claude Code CLI → Antigravity CLI)</option>
                  <option value="claude">Claude Code CLI (`claude -p`)</option>
                  <option value="agy">Antigravity CLI (`agy -p`)</option>
                </select>
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
                <textarea
                  value={formData.ai.promptTemplate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, promptTemplate: e.target.value },
                    })
                  }
                  rows={5}
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/40 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">
                  Chỉ Dẫn Nghiệp Vụ Bổ Sung
                </label>
                <input
                  type="text"
                  value={formData.ai.customInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, customInstructions: e.target.value },
                    })
                  }
                  placeholder="Ví dụ: Tập trung vào kết quả bàn giao, bỏ qua các commit merge…"
                  className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white/90 placeholder-white/40 text-xs focus:outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/40 transition-colors"
                />
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-white/80 font-medium mb-1">Đích Đến Mặc Định</label>
                <select
                  value={formData.workflow.destination}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workflow: {
                        ...formData.workflow,
                        destination: e.target.value as 'parabol' | 'slack' | 'copy_only',
                      },
                    })
                  }
                  className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white/90 text-xs focus:outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/40 transition-colors"
                >
                  <option value="parabol">Parabol (Mở tab parabol.co và tự kích hoạt)</option>
                  <option value="slack">Slack Web / App</option>
                  <option value="copy_only">
                    Chỉ sao chép vào Clipboard (Không mở trình duyệt)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">Trình Duyệt Ưu Tiên</label>
                <select
                  value={formData.workflow.browser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workflow: {
                        ...formData.workflow,
                        browser: e.target.value as
                          'Brave Browser' | 'Google Chrome' | 'Arc' | 'Safari',
                      },
                    })
                  }
                  className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white/90 text-xs focus:outline-none focus:border-sky-400/80 focus:ring-1 focus:ring-sky-400/40 transition-colors"
                >
                  <option value="Brave Browser">Brave Browser</option>
                  <option value="Google Chrome">Google Chrome</option>
                  <option value="Arc">Arc Browser</option>
                  <option value="Safari">Safari</option>
                </select>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                  Ứng dụng sẽ tìm tab Parabol đang mở trên trình duyệt này bằng AppleScript để
                  chuyển tới ngay lập tức.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
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
                    className="h-3.5 w-3.5 rounded border-white/30 text-sky-500 focus:ring-0 bg-black/40 cursor-pointer"
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
                    className="h-3.5 w-3.5 rounded border-white/30 text-sky-500 focus:ring-0 bg-black/40 cursor-pointer"
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
              <div className="p-3 rounded-lg bg-black/25 border border-white/[0.06] space-y-2">
                <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  Trạng Thái Công Cụ Hệ Thống
                </h4>

                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
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

                <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
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
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-sky-400/80 font-mono text-[11px]"
                    />
                  </div>
                  <button
                    onClick={handleSaveTokenClick}
                    disabled={!tokenInput.trim()}
                    className="h-8 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-medium text-xs transition-colors"
                  >
                    {tokenSaved ? 'Đã lưu' : 'Lưu Keychain'}
                  </button>
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

        {/* Footer của Modal */}
        <div className="flex items-center justify-end gap-2 px-5 py-2.5 border-t border-white/[0.08] bg-black/20 shrink-0">
          <button
            onClick={onClose}
            className="h-7.5 px-3 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="h-7.5 flex items-center gap-1.5 px-3.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

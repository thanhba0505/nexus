import React, { useState } from 'react';
import {
  RefreshCw,
  ArrowDownCircle,
  CheckCircle2,
  Info,
  Sliders,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  Download,
} from 'lucide-react';
import { Modal } from './Modal';
import { clsx } from 'clsx';

export type NexusUpdateStatus =
  'idle' | 'checking' | 'available' | 'latest' | 'updating' | 'restarting';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string | undefined;
  updateStatus: NexusUpdateStatus;
  latestReleaseInfo?:
    | {
        version: string;
        downloadUrl?: string | undefined;
      }
    | null
    | undefined;
  onCheckUpdate: () => void;
  onApplyUpdate: () => void;
  autoHideOnLaunch?: boolean | undefined;
  onToggleAutoHide?: (() => void) | undefined;
  onResetDefaultApps?: (() => void) | undefined;
}

type SettingsTab = 'updates' | 'preferences' | 'about';

export function SettingsModal({
  isOpen,
  onClose,
  currentVersion = '0.4.0',
  updateStatus,
  latestReleaseInfo,
  onCheckUpdate,
  onApplyUpdate,
  autoHideOnLaunch = true,
  onToggleAutoHide,
  onResetDefaultApps,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('updates');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetApps = () => {
    if (onResetDefaultApps) {
      onResetDefaultApps();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  const hasUpdate = updateStatus === 'available';
  const isChecking = updateStatus === 'checking';
  const isUpdating = updateStatus === 'updating' || updateStatus === 'restarting';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt hệ thống"
      subtitle="Quản lý cập nhật, tùy chọn và thông tin hệ sinh thái Nexus"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col space-y-4">
        {/* Segmented Tab Controls */}
        <div className="flex items-center p-1 bg-white/[0.06] rounded-xl border border-white/10 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={clsx(
              'flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg transition-all',
              activeTab === 'updates'
                ? 'bg-white/15 text-white shadow-sm border border-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', isChecking && 'animate-spin text-sky-400')} />
            <span>Cập nhật</span>
            {hasUpdate && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={clsx(
              'flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg transition-all',
              activeTab === 'preferences'
                ? 'bg-white/15 text-white shadow-sm border border-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tùy chọn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={clsx(
              'flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg transition-all',
              activeTab === 'about'
                ? 'bg-white/15 text-white shadow-sm border border-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5',
            )}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Giới thiệu</span>
          </button>
        </div>

        {/* Tab 1: Updates */}
        {activeTab === 'updates' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Version Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border border-white/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Nexus Launchpad</h4>
                  <p className="text-xs text-white/50">Phiên bản hiện tại: v{currentVersion}</p>
                </div>
              </div>

              <div>
                {hasUpdate ? (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Có bản mới: v{latestReleaseInfo?.version}
                  </span>
                ) : updateStatus === 'latest' ? (
                  <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mới nhất</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/10 text-white/60">
                    Ổn định (Stable)
                  </span>
                )}
              </div>
            </div>

            {/* Action Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white/90">
                    Cập nhật hệ sinh thái Nexus
                  </h5>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Kiểm tra các phiên bản mới của Nexus và các mini-app từ kho GitHub Releases.
                  </p>
                </div>
              </div>

              {hasUpdate ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-200">
                      Đã có phiên bản v{latestReleaseInfo?.version}
                    </span>
                    <span className="text-[10px] text-amber-300/80">Khuyên dùng nâng cấp</span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={onApplyUpdate}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      <span>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật toàn bộ ngay'}</span>
                    </button>
                    {latestReleaseInfo?.downloadUrl && (
                      <a
                        href={latestReleaseInfo.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center space-x-1 p-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 transition-colors"
                        title="Tải gói cài đặt trực tiếp"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-white/60">
                    {updateStatus === 'latest'
                      ? 'Hệ sinh thái Nexus đã ở phiên bản mới nhất.'
                      : 'Kênh cập nhật: github.com/thanhba0505/nexus'}
                  </span>
                  <button
                    type="button"
                    disabled={isChecking}
                    onClick={onCheckUpdate}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={clsx('w-3.5 h-3.5', isChecking && 'animate-spin')} />
                    <span>{isChecking ? 'Đang kiểm tra...' : 'Kiểm tra cập nhật'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Auto hide preference */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-semibold text-white/90">
                  Tự động ẩn sau khi mở ứng dụng
                </h5>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Tự động thu nhỏ Nexus khi bạn bấm khởi chạy một mini app.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleAutoHide}
                className={clsx(
                  'w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer',
                  autoHideOnLaunch ? 'bg-sky-500' : 'bg-white/20',
                )}
              >
                <div
                  className={clsx(
                    'bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out',
                    autoHideOnLaunch ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {/* Reset apps */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-semibold text-white/90">
                  Khôi phục danh sách mặc định
                </h5>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Đặt lại màn hình chính với các ứng dụng chuẩn (SlackBot, GitHub Report).
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetApps}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 text-white/80 border border-white/10 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetSuccess ? 'Đã khôi phục!' : 'Khôi phục'}</span>
              </button>
            </div>

            {/* Shortcuts Guide */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h5 className="text-xs font-semibold text-white/90">Phím tắt & Thao tác nhanh</h5>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-white/60">Đóng Launchpad</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white/90 font-mono text-[10px]">
                    Esc
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-white/60">Menu ứng dụng</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white/90 font-mono text-[10px]">
                    Chuột phải
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-white/60">Di chuyển cửa sổ</span>
                  <span className="text-white/70">Kéo header</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-white/60">Tìm kiếm nhanh</span>
                  <span className="text-white/70">Gõ từ khóa</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: About */}
        {activeTab === 'about' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Brand Box */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 border border-white/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-wide">Nexus Launchpad</h4>
                <p className="text-xs text-white/60 mt-0.5">
                  Nền tảng Launchpad trung tâm & quản lý hệ sinh thái macOS
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v{currentVersion}
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  macOS Native
                </span>
              </div>
            </div>

            {/* Architecture Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center space-x-1.5 text-white/50 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bundle ID</span>
                </div>
                <p className="font-mono text-white/90 truncate">com.thanhba.nexus</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center space-x-1.5 text-white/50 mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Nền tảng</span>
                </div>
                <p className="text-white/90">Tauri v2 + Rust + React 19</p>
              </div>
            </div>

            {/* GitHub and Author Link */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              <span className="text-white/50">Phát triển bởi Lê Thanh Bá</span>
              <a
                href="https://github.com/thanhba0505/nexus"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Kho lưu trữ GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

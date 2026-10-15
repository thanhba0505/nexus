import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Loading';

export interface MiniAppShellProps {
  /** Header cửa sổ — thường là `MiniAppHeader`. */
  header: React.ReactNode;
  /** Thanh trạng thái dưới cùng — thường là `MiniAppStatusBar`. */
  footer?: React.ReactNode;
  /** Modal / popover phủ lên nội dung. */
  overlays?: React.ReactNode;
  /** Splash screen — render khi chưa sẵn sàng (`!boot.isReady && <AppSplashScreen … />`). */
  splash?: React.ReactNode;
  /** Nội dung chính. */
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

/**
 * Khung bố cục chuẩn cho mọi mini app Nexus:
 * `header` → `main` (cuộn nội bộ) → `footer`, với `overlays` và `splash` phủ lên trên.
 *
 * Nội dung chính luôn được render bên dưới splash, nên khi splash fade-out
 * giao diện đã sẵn sàng — không có khung trắng hay nhảy layout.
 */
export function MiniAppShell({
  header,
  footer,
  overlays,
  splash,
  children,
  className,
  mainClassName,
}: MiniAppShellProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative flex h-screen w-screen select-none flex-col overflow-hidden rounded-[14px] border border-white/10 bg-slate-950 font-sans text-white',
          className,
        ),
      )}
    >
      {header}
      <main className={twMerge(clsx('flex min-h-0 flex-1 flex-col', mainClassName))}>
        {children}
      </main>
      {footer}
      {overlays}
      {splash}
    </div>
  );
}

export type StatusTone = 'default' | 'busy' | 'success' | 'error';

export interface MiniAppStatusBarProps {
  message: string;
  tone?: StatusTone;
  /** Chỉ báo bổ sung bên phải (trạng thái CLI, tài khoản…). */
  rightSlot?: React.ReactNode;
  className?: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
  default: 'text-white/60',
  busy: 'text-sky-300',
  success: 'text-emerald-300',
  error: 'text-rose-400 font-medium',
};

/** Thanh trạng thái 28px dưới cùng cửa sổ mini app. */
export function MiniAppStatusBar({
  message,
  tone = 'default',
  rightSlot,
  className,
}: MiniAppStatusBarProps) {
  return (
    <footer
      className={twMerge(
        clsx(
          'flex h-7 w-full shrink-0 select-none items-center justify-between gap-3 border-t border-white/10 bg-slate-900/90 px-3 text-[11px]',
          className,
        ),
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {tone === 'busy' && <Spinner className="h-2.5 w-2.5" />}
        <span className={clsx('truncate', TONE_CLASS[tone])} title={message}>
          {message}
        </span>
      </div>
      {rightSlot && <div className="flex shrink-0 items-center gap-3">{rightSlot}</div>}
    </footer>
  );
}

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type AppTheme = 'nexus' | 'github-report' | 'slackbot' | 'pet-2d';

export interface AppLayoutProps {
  /** Theme định danh cho app (tự động gắn class theme và bảng 5 màu) */
  theme?: AppTheme;
  /** Header phía trên (MiniAppHeader) */
  header?: React.ReactNode;
  /** Thanh điều hướng bên trái (AppSidebar) — tùy chọn */
  sidebar?: React.ReactNode;
  /** Thanh trạng thái dưới cùng (MiniAppStatusBar) — tùy chọn */
  footer?: React.ReactNode;
  /** Modal / popover phủ lên nội dung */
  overlays?: React.ReactNode;
  /** Splash screen khởi động */
  splash?: React.ReactNode;
  /** Bật/tắt hiệu ứng hào quang đỉnh cửa sổ (mặc định: true) */
  showAmbientGlow?: boolean;
  /** Nội dung làm việc chính */
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  bodyClassName?: string;
}

const THEME_CLASS_MAP: Record<AppTheme, string> = {
  nexus: 'theme-nexus',
  'github-report': 'theme-github-report',
  slackbot: 'theme-slackbot',
  'pet-2d': 'theme-pet-2d',
};

export function AppLayout({
  theme = 'nexus',
  header,
  sidebar,
  footer,
  overlays,
  splash,
  showAmbientGlow = true,
  children,
  className,
  mainClassName,
  bodyClassName,
}: AppLayoutProps) {
  const themeClass = THEME_CLASS_MAP[theme] || 'theme-nexus';

  return (
    <div
      className={twMerge(
        clsx(
          'relative flex h-screen w-screen select-none flex-col overflow-hidden rounded-[14px] border border-[var(--app-tone-3)]/30 font-sans text-[var(--app-tone-1)]',
          themeClass,
          showAmbientGlow ? 'nexus-ambient-canvas' : 'bg-[var(--app-tone-5)]',
          className,
        ),
      )}
    >
      {header}

      {sidebar ? (
        <div className={twMerge(clsx('flex min-h-0 flex-1 w-full overflow-hidden', bodyClassName))}>
          {sidebar}
          <main
            className={twMerge(
              clsx('flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar', mainClassName),
            )}
          >
            {children}
          </main>
        </div>
      ) : (
        <main
          className={twMerge(clsx('flex min-h-0 flex-1 flex-col overflow-hidden', mainClassName))}
        >
          {children}
        </main>
      )}

      {footer}
      {overlays}
      {splash}
    </div>
  );
}

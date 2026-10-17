import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Loading';

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Biến thể nút:
   * - primary: Dùng màu Tone 3 làm nền, chữ đậm Tone 5, đổ bóng thương hiệu
   * - secondary: Nền kính mờ Tone 4 + viền Tone 3, chữ Tone 1
   * - glass: Nền kính trắng mờ trung tính (white/10)
   * - ghost: Nút phẳng trong suốt, chỉ nổi khi hover
   * - danger: Nút cảnh báo (rose-500)
   */
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  hotkey?: string;
}

const VARIANT_MAP = {
  primary:
    'bg-[var(--app-tone-3)] hover:brightness-110 active:brightness-95 text-[var(--app-tone-5)] font-bold shadow-[0_4px_16px_rgba(var(--app-tone-3-rgb),0.35)] border border-[var(--app-tone-3)]/40',
  secondary:
    'bg-[var(--app-tone-4)]/85 hover:bg-[var(--app-tone-4)] text-[var(--app-tone-1)] border border-[var(--app-tone-3)]/30 hover:border-[var(--app-tone-3)]/60 shadow-sm',
  glass:
    'bg-[var(--app-tone-3)]/10 hover:bg-[var(--app-tone-3)]/20 text-white border border-[var(--app-tone-3)]/30 backdrop-blur-xl shadow-md',
  ghost: 'hover:bg-[var(--app-tone-3)]/15 text-[var(--app-tone-2)] hover:text-[var(--app-tone-1)]',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110 shadow-lg shadow-rose-950/50 border border-rose-400/30',
};

const SIZE_MAP = {
  xs: 'px-2 py-1 text-[11px] rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
  icon: 'p-2 rounded-xl flex items-center justify-center shrink-0',
};

export function AppButton({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  hotkey,
  children,
  className,
  disabled,
  ...rest
}: AppButtonProps) {
  return (
    <button
      data-no-drag
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      disabled={disabled || loading}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-150 outline-none select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
          VARIANT_MAP[variant],
          SIZE_MAP[size],
          className,
        ),
      )}
      {...rest}
    >
      {loading ? (
        <Spinner className="w-3.5 h-3.5 shrink-0" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      {children}
      {hotkey && (
        <span
          className={clsx(
            'text-[10px] font-mono px-1.5 py-0.2 rounded ml-1.5 shrink-0',
            variant === 'primary'
              ? 'bg-[var(--app-tone-5)]/20 text-[var(--app-tone-5)]'
              : 'bg-[var(--app-tone-3)]/15 text-[var(--app-tone-2)] border border-[var(--app-tone-3)]/25',
          )}
        >
          {hotkey}
        </span>
      )}
    </button>
  );
}

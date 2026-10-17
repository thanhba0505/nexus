import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ContentCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Tiêu đề khối */
  title?: React.ReactNode;
  /** Mô tả phụ dưới tiêu đề */
  subtitle?: React.ReactNode;
  /** Biểu tượng tiêu đề */
  icon?: React.ComponentType<{ className?: string }>;
  /** Huy hiệu trạng thái góc phải tiêu đề */
  badge?: React.ReactNode;
  /** Cụm nút thao tác góc phải */
  actions?: React.ReactNode;
  /** Biến thể nền card */
  variant?: 'acrylic' | 'subtle' | 'flat';
  /** Có ánh phát quang góc hay không (mặc định: true cho acrylic) */
  glow?: boolean;
  /** Lề đệm chuẩn hóa: none | sm (p-3.5) | md (p-4.5 sm:p-5) | lg (p-6) */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  headerClassName?: string;
  children: React.ReactNode;
}

const PADDING_MAP = {
  none: 'p-0',
  sm: 'p-3.5',
  md: 'p-4.5 sm:p-5',
  lg: 'p-6',
};

const VARIANT_MAP = {
  acrylic:
    'bg-gradient-to-br from-[var(--app-tone-4)]/85 via-[var(--app-tone-4)]/65 to-[var(--app-tone-5)]/90 border border-[var(--app-tone-3)]/30 shadow-2xl backdrop-blur-xl',
  subtle:
    'bg-[var(--app-tone-4)]/40 border border-[var(--app-tone-3)]/20 shadow-lg backdrop-blur-lg',
  flat: 'bg-[var(--app-tone-4)]/90 border border-[var(--app-tone-3)]/25 shadow-sm',
};

export function ContentCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  variant = 'acrylic',
  glow = true,
  padding = 'md',
  headerClassName,
  className,
  children,
  ...rest
}: ContentCardProps) {
  const hasHeader = Boolean(title || Icon || badge || actions);

  return (
    <div
      className={twMerge(
        clsx(
          'relative shrink-0 overflow-hidden rounded-2xl transition-all',
          VARIANT_MAP[variant],
          PADDING_MAP[padding],
          className,
        ),
      )}
      {...rest}
    >
      {/* Ambient corner glow */}
      {glow && variant === 'acrylic' && (
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--app-tone-3)]/15 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Structured Card Header */}
      {hasHeader && (
        <div
          className={twMerge(
            clsx('flex items-center justify-between mb-3.5 relative z-10', headerClassName),
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--app-tone-3)]/35 bg-[var(--app-tone-3)]/15 text-[var(--app-tone-3)] shadow-xs shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-[var(--app-tone-1)] tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-[var(--app-tone-2)] font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {badge &&
              (typeof badge === 'string' ? (
                <span className="text-[10px] font-mono text-[var(--app-tone-3)] bg-[var(--app-tone-3)]/15 border border-[var(--app-tone-3)]/30 px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              ) : (
                badge
              ))}
            {actions}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

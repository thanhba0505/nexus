import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number | string;
  badge?: number | string;
  disabled?: boolean;
}

export interface AppTabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'pills';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export const AppTabs: React.FC<AppTabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'segmented',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const isSegmented = variant === 'segmented';

  const containerBase = isSegmented
    ? 'inline-flex p-1 rounded-xl bg-black/35 border border-[var(--app-tone-3,#6366f1)]/25 backdrop-blur-md items-center'
    : 'inline-flex gap-1.5 items-center';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
  }[size];

  const itemRadius = isSegmented ? 'rounded-lg' : 'rounded-xl';

  return (
    <div
      role="tablist"
      data-no-drag
      className={`${containerBase} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        const displayCount = tab.count !== undefined ? tab.count : tab.badge;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            data-no-drag
            className={`
              relative flex items-center justify-center font-medium transition-all duration-150 select-none
              active:scale-[0.98] outline-none
              ${sizeClasses}
              ${itemRadius}
              ${fullWidth ? 'flex-1' : ''}
              ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${
                isActive
                  ? 'bg-[var(--app-tone-3,#6366f1)] text-[var(--app-tone-5,#070714)] font-bold shadow-md shadow-[var(--app-tone-3,#6366f1)]/25'
                  : isSegmented
                    ? 'text-[var(--app-tone-2,#a5b4fc)]/80 hover:text-white hover:bg-white/[0.06]'
                    : 'text-[var(--app-tone-2,#a5b4fc)]/80 bg-[var(--app-tone-3,#6366f1)]/[0.06] border border-[var(--app-tone-3,#6366f1)]/20 hover:text-white hover:bg-[var(--app-tone-3,#6366f1)]/15'
              }
            `}
          >
            {Icon && (
              <Icon
                className={`shrink-0 ${
                  size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
                } ${isActive ? 'text-inherit' : 'text-current opacity-80'}`}
              />
            )}
            <span>{tab.label}</span>
            {displayCount !== undefined && (
              <span
                className={`
                  ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums leading-none
                  ${
                    isActive
                      ? 'bg-[var(--app-tone-5,#070714)]/25 text-[var(--app-tone-5,#070714)] font-bold'
                      : 'bg-[var(--app-tone-3,#6366f1)]/20 text-[var(--app-tone-2,#a5b4fc)] border border-[var(--app-tone-3,#6366f1)]/20'
                  }
                `}
              >
                {displayCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

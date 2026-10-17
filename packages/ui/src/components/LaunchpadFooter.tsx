import React from 'react';
import { clsx } from 'clsx';
import { AppCategory, APP_CATEGORY } from '@nexus/shared';

export interface LaunchpadFooterProps {
  currentCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
  onPowerOff?: () => void;
}

export function LaunchpadFooter({ currentCategory, onSelectCategory }: LaunchpadFooterProps) {
  const categories: readonly { id: AppCategory; label: string }[] = [
    { id: APP_CATEGORY.ALL, label: 'All' },
    { id: APP_CATEGORY.DEV, label: 'Dev' },
    { id: APP_CATEGORY.CHAT, label: 'Chat' },
    { id: APP_CATEGORY.GAMES, label: 'Games' },
  ];

  return (
    <footer className="w-full h-20 px-8 flex items-center justify-center relative z-10 pb-6 pointer-events-none shrink-0">
      {/* Center Floating Dock */}
      <div
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="pointer-events-auto flex items-center p-1.5 rounded-2xl bg-[var(--app-tone-4,#131238)]/75 border border-[var(--app-tone-3,#6366f1)]/25 backdrop-blur-2xl shadow-2xl shadow-black/40 space-x-1"
      >
        {categories.map((category) => {
          const isActive = currentCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              data-no-drag
              data-tauri-drag-region="false"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              onClick={() => onSelectCategory(category.id)}
              className={clsx(
                'px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95',
                isActive
                  ? 'bg-[var(--app-tone-3,#6366f1)] text-[var(--app-tone-5,#070714)] shadow-md shadow-[var(--app-tone-3,#6366f1)]/30 font-bold'
                  : 'text-[var(--app-tone-2,#a5b4fc)]/70 hover:text-white hover:bg-[var(--app-tone-3,#6366f1)]/15',
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </footer>
  );
}

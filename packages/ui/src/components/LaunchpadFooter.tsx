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
        className="pointer-events-auto flex items-center p-1.5 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40 space-x-1"
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
                  ? 'bg-white/20 text-white shadow-sm shadow-black/30 font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.08]',
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

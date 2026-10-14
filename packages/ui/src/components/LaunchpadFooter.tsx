import React from 'react';
import { clsx } from 'clsx';
import { Power, Plus } from 'lucide-react';
import { AppCategory, APP_CATEGORY } from '@nexus/shared';

export interface LaunchpadFooterProps {
  currentCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
  onPowerOff?: () => void;
}

export function LaunchpadFooter({
  currentCategory,
  onSelectCategory,
  onPowerOff,
}: LaunchpadFooterProps) {
  const categories: readonly { id: AppCategory; label: string }[] = [
    { id: APP_CATEGORY.ALL, label: 'All' },
    { id: APP_CATEGORY.DEV, label: 'Dev' },
    { id: APP_CATEGORY.CHAT, label: 'Chat' },
    { id: APP_CATEGORY.GAMES, label: 'Games' },
  ];

  return (
    <footer className="w-full h-20 px-8 flex items-center justify-center relative z-10 pb-4">
      {/* Center Floating Dock */}
      <div className="flex items-center p-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-2xl shadow-dock space-x-1">
        {categories.map((category) => {
          const isActive = currentCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={clsx(
                'px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/25 text-white shadow-sm shadow-black/20 font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
              )}
            >
              {category.label}
            </button>
          );
        })}

        <button
          className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
          title="Thêm ứng dụng"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right Power/Exit Button */}
      <div className="absolute right-8">
        <button
          onClick={onPowerOff}
          className="p-2.5 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 transition-all backdrop-blur-xl shadow-md"
          title="Thoát Launchpad"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}

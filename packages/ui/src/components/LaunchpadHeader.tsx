import React from 'react';
import { Search, Settings } from 'lucide-react';
import { WindowControls } from './WindowControls';

export interface LaunchpadHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings?: (() => void) | undefined;
  hasNexusUpdate?: boolean | undefined;
  settingsMenu?: React.ReactNode | undefined;
  onMouseDown?: ((e: React.MouseEvent) => void) | undefined;
  showWindowControls?: boolean | undefined;
  onClose?: (() => void) | undefined;
}

export function LaunchpadHeader({
  searchQuery,
  onSearchChange,
  onOpenSettings,
  hasNexusUpdate = false,
  settingsMenu,
  onMouseDown,
  showWindowControls = true,
  onClose,
}: LaunchpadHeaderProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={onMouseDown}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="w-full h-16 px-6 flex items-center justify-between z-10 select-none cursor-default shrink-0"
    >
      {/* Left controls: Window Controls */}
      <div
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center w-32"
      >
        {showWindowControls && <WindowControls closeAction="hide" onClose={onClose} />}
      </div>

      {/* Center Search Bar */}
      <div
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="relative w-80 sm:w-96 max-w-md"
      >
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Tìm kiếm ứng dụng..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-[var(--app-tone-3,#6366f1)]/25 focus:border-[var(--app-tone-3,#6366f1)]/50 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--app-tone-3,#6366f1)]/40 backdrop-blur-xl transition-all cursor-text shadow-inner shadow-black/20"
        />
      </div>

      {/* Right controls: Settings */}
      <div
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="relative flex items-center justify-end w-32"
      >
        <div className="relative">
          <button
            type="button"
            data-no-drag
            data-tauri-drag-region="false"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            onClick={onOpenSettings}
            className="p-2.5 rounded-full bg-[var(--app-tone-3,#6366f1)]/10 hover:bg-[var(--app-tone-3,#6366f1)]/20 text-white/80 hover:text-white transition-all backdrop-blur-lg border border-[var(--app-tone-3,#6366f1)]/25 cursor-pointer active:scale-95"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
            {hasNexusUpdate && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-900 animate-pulse" />
            )}
          </button>
          {settingsMenu}
        </div>
      </div>
    </header>
  );
}

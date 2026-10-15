import React from 'react';
import { Search, LayoutGrid, Folder, Settings } from 'lucide-react';

export interface LaunchpadHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings?: () => void;
  hasNexusUpdate?: boolean;
  settingsMenu?: React.ReactNode;
  onMouseDown?: ((e: React.MouseEvent) => void) | undefined;
}

export function LaunchpadHeader({
  searchQuery,
  onSearchChange,
  onOpenSettings,
  hasNexusUpdate = false,
  settingsMenu,
  onMouseDown,
}: LaunchpadHeaderProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={onMouseDown}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="w-full h-16 px-6 flex items-center justify-between z-10 select-none cursor-default"
    >
      {/* Left controls: Grid Switch */}
      <div
        data-no-drag
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center space-x-2"
      >
        <button
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-lg border border-white/10 cursor-pointer"
          title="App Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      {/* Center Search Bar */}
      <div
        data-no-drag
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="relative w-72 sm:w-80"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Tìm kiếm ứng dụng..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-white/10 border border-white/15 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-xl transition-all cursor-text"
        />
      </div>

      {/* Right controls: Folder & Settings */}
      <div
        data-no-drag
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="relative flex items-center space-x-2"
      >
        <button
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-lg border border-white/10 cursor-pointer"
          title="Categories"
        >
          <Folder className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={onOpenSettings}
            className="relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-lg border border-white/10 cursor-pointer"
            title="Cài đặt & Cập nhật"
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

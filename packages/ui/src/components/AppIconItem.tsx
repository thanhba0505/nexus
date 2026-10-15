import React from 'react';
import { clsx } from 'clsx';
import {
  Code,
  Globe,
  Terminal,
  Bot,
  FileCode,
  Mail,
  Github,
  Laptop,
  Palette,
  Shield,
  Gamepad2,
  LayoutGrid,
  MessageSquare,
  GitPullRequest,
  Box,
  Plus,
} from 'lucide-react';
import { NexusAppMeta } from '@nexus/shared';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  MessageSquare,
  GitPullRequest,
  Code,
  Globe,
  Terminal,
  Bot,
  FileCode,
  Mail,
  Github,
  Laptop,
  Palette,
  Shield,
  Gamepad2,
};

export interface AppIconItemProps {
  app?: NexusAppMeta | undefined;
  isSelected?: boolean | undefined;
  onSelect?: ((app: NexusAppMeta) => void) | undefined;
  onLaunch?: ((app: NexusAppMeta) => void) | undefined;
  onContextMenu?: ((e: React.MouseEvent, app: NexusAppMeta) => void) | undefined;
  isAddButton?: boolean | undefined;
  onAddClick?: (() => void) | undefined;
}

export function AppIconItem({
  app,
  isSelected = false,
  onSelect,
  onLaunch,
  onContextMenu,
  isAddButton = false,
  onAddClick,
}: AppIconItemProps) {
  // If this is the "+" Add Button
  if (isAddButton) {
    return (
      <button
        type="button"
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onClick={onAddClick}
        className="group flex flex-col items-center justify-center p-3 rounded-2xl outline-none focus:outline-none transition-all duration-200 cursor-pointer"
        title="Thêm mini app vào màn hình"
      >
        <div
          className={clsx(
            'relative w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[24px]',
            'flex items-center justify-center text-white/70 shadow-lg shadow-black/25',
            'border border-dashed border-white/25 bg-white/[0.04] backdrop-blur-md',
            'group-hover:scale-105 group-hover:border-white/50 group-hover:text-white group-hover:bg-white/[0.08] group-hover:shadow-xl group-hover:shadow-black/40',
            'transition-all duration-200 ease-out active:scale-95',
          )}
        >
          <Plus className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md text-white/50 group-hover:text-white transition-colors pointer-events-none" />
        </div>
        <span className="mt-2.5 text-xs font-medium text-white/60 group-hover:text-white transition-colors truncate max-w-[96px] text-center">
          Thêm app
        </span>
      </button>
    );
  }

  if (!app) return null;

  const IconComponent = ICON_MAP[app.iconName] || Box;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(app);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLaunch) onLaunch(app);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) onContextMenu(e, app);
  };

  return (
    <button
      type="button"
      data-no-drag
      data-tauri-drag-region="false"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      title={`${app.name} (Nhấp đúp để mở)`}
      className="group relative flex flex-col items-center justify-center p-3 rounded-2xl outline-none focus:outline-none transition-all duration-200 cursor-pointer"
    >
      {/* macOS Squircle Icon Container */}
      <div
        style={{
          background: `linear-gradient(135deg, ${app.accentColor}dd, ${app.accentColor}99)`,
        }}
        className={clsx(
          'relative w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[24px]',
          'flex items-center justify-center text-white shadow-xl shadow-black/30',
          'border border-white/20 backdrop-blur-md',
          'group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/50',
          'transition-transform duration-200 ease-out active:scale-95',
          isSelected && 'ring-2 ring-white/70 ring-offset-2 ring-offset-transparent',
        )}
      >
        <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md pointer-events-none" />

        {/* Loading Overlay when Updating */}
        {app.isUpdating && (
          <div className="absolute inset-0 rounded-[22px] sm:rounded-[24px] bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Running Indicator (Active App) */}
        {app.isRunning && (
          <span className="absolute -bottom-1.5 w-3 h-1 bg-emerald-400 rounded-full shadow-md shadow-emerald-400/50 pointer-events-none" />
        )}
      </div>

      {/* Label */}
      <span className="mt-2.5 text-xs sm:text-[13px] font-medium text-white/90 group-hover:text-white transition-colors truncate max-w-[96px] text-center tracking-tight">
        {app.name}
      </span>
    </button>
  );
}

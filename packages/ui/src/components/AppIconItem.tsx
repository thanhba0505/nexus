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
        onClick={onAddClick}
        className="group flex flex-col items-center justify-center p-2 rounded-2xl outline-none focus:outline-none transition-all duration-200"
        title="Thêm mini app vào màn hình"
      >
        <div
          className={clsx(
            'relative w-16 h-16 sm:w-18 sm:h-18 rounded-[20px] sm:rounded-[22px]',
            'flex items-center justify-center text-white/70 shadow-lg',
            'border border-dashed border-white/30 bg-white/5 backdrop-blur-md',
            'group-hover:scale-105 group-hover:border-white/60 group-hover:text-white group-hover:bg-white/10 group-hover:shadow-xl group-hover:shadow-black/30',
            'transition-all duration-200 ease-out active:scale-95',
          )}
        >
          <Plus className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
        </div>
        <span className="mt-2 text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate max-w-[80px]">
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
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      title={`${app.name} (Nhấp đúp để mở)`}
      className="group relative flex flex-col items-center justify-center p-2 rounded-2xl outline-none focus:outline-none transition-all duration-200"
    >
      {/* macOS Squircle Icon Container */}
      <div
        style={{
          background: `linear-gradient(135deg, ${app.accentColor}dd, ${app.accentColor}99)`,
        }}
        className={clsx(
          'relative w-16 h-16 sm:w-18 sm:h-18 rounded-[20px] sm:rounded-[22px]',
          'flex items-center justify-center text-white shadow-lg',
          'border border-white/20 backdrop-blur-md',
          'group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-black/40',
          'transition-transform duration-200 ease-out active:scale-95',
          isSelected && 'ring-2 ring-white/60',
        )}
      >
        <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />

        {/* Loading Overlay when Updating */}
        {app.isUpdating && (
          <div className="absolute inset-0 rounded-[20px] sm:rounded-[22px] bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Running Indicator (Active App) */}
        {app.isRunning && (
          <span className="absolute -bottom-1 w-2.5 h-1 bg-emerald-400 rounded-full shadow-sm" />
        )}
      </div>

      {/* Label */}
      <span className="mt-2 text-xs font-medium text-white/90 group-hover:text-white transition-colors truncate max-w-[80px]">
        {app.name}
      </span>
    </button>
  );
}

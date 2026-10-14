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
  app: NexusAppMeta;
  isSelected?: boolean;
  onLaunch: (app: NexusAppMeta) => void;
}

export function AppIconItem({ app, isSelected = false, onLaunch }: AppIconItemProps) {
  const IconComponent = ICON_MAP[app.iconName] || Box;

  const handleClick = () => {
    onLaunch(app);
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center justify-center p-2 rounded-2xl outline-none focus:outline-none transition-all duration-200"
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

        {/* Status Indicator Dot */}
        {app.status === 'ready' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-sm" />
        )}
      </div>

      {/* App Name Label */}
      <span className="mt-2 text-xs sm:text-sm font-medium text-white/90 group-hover:text-white drop-shadow tracking-wide text-center truncate max-w-[80px]">
        {app.name}
      </span>
    </button>
  );
}

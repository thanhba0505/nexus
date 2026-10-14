import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppStatus, APP_STATUS } from '@nexus/shared';

export interface BadgeProps {
  status: AppStatus;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const isReady = status === APP_STATUS.READY;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md transition-all',
          isReady
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          className,
        ),
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          isReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
        )}
      />
      {isReady ? 'Ready' : 'Coming soon'}
    </span>
  );
}

import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled || !content) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={clsx(
            'absolute z-50 px-2.5 py-1 text-[11px] font-medium text-slate-950 bg-amber-400 rounded-lg shadow-xl whitespace-nowrap pointer-events-none',
            'animate-in fade-in zoom-in-95 duration-100',
            positionClasses,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

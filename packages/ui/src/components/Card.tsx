import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isFrosted?: boolean;
}

export function Card({ children, className, isFrosted = true, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-6 transition-all',
          isFrosted
            ? 'bg-[var(--app-tone-4,#131238)]/60 backdrop-blur-2xl border border-[var(--app-tone-3,#6366f1)]/25 shadow-2xl text-white'
            : 'bg-[var(--app-tone-4,#131238)] border border-[var(--app-tone-3,#6366f1)]/20 text-white/90',
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
}

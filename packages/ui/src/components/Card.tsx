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
            ? 'bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl text-white'
            : 'bg-slate-900 border border-slate-800 text-slate-100',
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
}

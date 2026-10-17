import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({
  children,
  className,
  variant = 'glass',
  size = 'md',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30',
    secondary:
      'bg-[var(--app-tone-4,#131238)]/85 hover:bg-[var(--app-tone-4,#131238)] text-white border border-[var(--app-tone-3,#6366f1)]/30',
    ghost: 'hover:bg-[var(--app-tone-3,#6366f1)]/15 text-white/80 hover:text-white',
    glass:
      'bg-[var(--app-tone-3,#6366f1)]/10 hover:bg-[var(--app-tone-3,#6366f1)]/20 text-white border border-[var(--app-tone-3,#6366f1)]/30 backdrop-blur-xl shadow-md transition-all active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-2xl',
    icon: 'p-2 rounded-xl flex items-center justify-center',
  };

  return (
    <button
      className={twMerge(
        'font-medium transition-all duration-150 inline-flex items-center justify-center cursor-pointer outline-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

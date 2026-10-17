import React, { useId, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AppInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md';
  leadingIcon?: React.ComponentType<{ className?: string }>;
  trailingSlot?: React.ReactNode;
  inputClassName?: string;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      id: customId,
      label,
      error,
      hint,
      size = 'md',
      leadingIcon: LeadingIcon,
      trailingSlot,
      disabled = false,
      className,
      inputClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;

    return (
      <div className={twMerge(clsx('relative w-full', className))}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-medium text-white/80 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {LeadingIcon && (
            <div className="absolute left-3 pointer-events-none flex items-center justify-center text-[var(--app-tone-2)]/70">
              <LeadingIcon className="w-3.5 h-3.5" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full text-xs transition-all duration-150 outline-hidden select-text',
                'bg-[var(--app-tone-5,#070714)] border border-[var(--app-border)] text-[var(--app-tone-1,#f0fdf9)]',
                'placeholder:text-[var(--app-tone-2)]/40',
                'hover:border-[var(--app-tone-3,#6366f1)]/50',
                'focus:border-[var(--app-tone-3,#6366f1)]/60 focus:ring-1 focus:ring-[var(--app-tone-3,#6366f1)]/40',
                size === 'sm'
                  ? 'px-2.5 py-1.5 rounded-lg min-h-[32px]'
                  : 'px-3 py-2 rounded-xl min-h-[38px]',
                LeadingIcon && (size === 'sm' ? 'pl-8' : 'pl-9'),
                trailingSlot && (size === 'sm' ? 'pr-8' : 'pr-9'),
                error &&
                  'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40 text-rose-200',
                disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
              ),
              inputClassName,
            )}
            {...props}
          />

          {trailingSlot && (
            <div className="absolute right-2.5 flex items-center">{trailingSlot}</div>
          )}
        </div>

        {error ? (
          <p className="mt-1 text-[10px] text-rose-400 font-medium select-none">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-[10px] text-[var(--app-tone-2)]/70 select-none">{hint}</p>
        ) : null}
      </div>
    );
  },
);

AppInput.displayName = 'AppInput';

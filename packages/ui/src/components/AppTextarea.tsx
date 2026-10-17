import React, { useId, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md';
  textareaClassName?: string;
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  (
    {
      id: customId,
      label,
      error,
      hint,
      size = 'md',
      disabled = false,
      className,
      textareaClassName,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;

    return (
      <div className={twMerge(clsx('relative w-full', className))}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[11px] font-medium text-white/80 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={twMerge(
            clsx(
              'w-full text-xs transition-all duration-150 outline-hidden select-text resize-y custom-scrollbar',
              'bg-[var(--app-tone-5,#070714)] border border-[var(--app-border)] text-[var(--app-tone-1,#f0fdf9)]',
              'placeholder:text-[var(--app-tone-2)]/40',
              'hover:border-[var(--app-tone-3,#6366f1)]/50',
              'focus:border-[var(--app-tone-3,#6366f1)]/60 focus:ring-1 focus:ring-[var(--app-tone-3,#6366f1)]/40',
              size === 'sm'
                ? 'px-2.5 py-1.5 rounded-lg min-h-[64px]'
                : 'px-3 py-2 rounded-xl min-h-[80px]',
              error &&
                'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40 text-rose-200',
              disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
            ),
            textareaClassName,
          )}
          {...props}
        />

        {error ? (
          <p className="mt-1 text-[10px] text-rose-400 font-medium select-none">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-[10px] text-[var(--app-tone-2)]/70 select-none">{hint}</p>
        ) : null}
      </div>
    );
  },
);

AppTextarea.displayName = 'AppTextarea';

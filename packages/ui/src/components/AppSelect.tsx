import React, { useState, useRef, useEffect, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';

export interface AppSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface AppSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: AppSelectOption<T>[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function AppSelect<T extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Chọn một mục…',
  disabled = false,
  className,
  size = 'md',
}: AppSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const selectId = useId();

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const [highlightedIndex, setHighlightedIndex] = useState<number>(
    selectedIndex >= 0 ? selectedIndex : 0,
  );

  // Đồng bộ index khi value thay đổi từ bên ngoài
  useEffect(() => {
    if (selectedIndex >= 0) {
      setHighlightedIndex(selectedIndex);
    }
  }, [selectedIndex]);

  // Đóng khi click ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Cuộn item được highlight vào view khi mở hoặc dùng phím
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      const targetItem = items[highlightedIndex] as HTMLElement | undefined;
      if (targetItem) {
        targetItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          while (next < options.length && options[next]?.disabled) {
            next++;
          }
          return next < options.length ? next : prev;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && options[next]?.disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const option = options[highlightedIndex];
        if (option && !option.disabled) {
          onChange(option.value);
          setIsOpen(false);
        }
        break;
      }
      case 'Tab': {
        setIsOpen(false);
        break;
      }
    }
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div ref={containerRef} className={twMerge(clsx('relative w-full', className))}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-medium text-white/80 mb-1.5 select-none"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={twMerge(
          clsx(
            'group w-full flex items-center justify-between gap-2.5 text-left transition-all duration-150 select-none outline-hidden',
            'bg-black/40 border border-[var(--app-tone-3)]/25 text-white/90',
            'hover:border-[var(--app-tone-3)]/45 hover:bg-black/50',
            isOpen &&
              'border-[var(--app-tone-3)]/60 ring-1 ring-[var(--app-tone-3)]/40 bg-black/60',
            size === 'sm'
              ? 'px-2.5 py-1.5 text-xs rounded-lg min-h-[32px]'
              : 'px-3 py-2 text-xs rounded-xl min-h-[38px]',
            disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          ),
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {SelectedIcon && (
            <SelectedIcon className="w-3.5 h-3.5 text-[var(--app-tone-3)] shrink-0" />
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          className={twMerge(
            clsx(
              'w-3.5 h-3.5 text-white/40 shrink-0 transition-transform duration-200',
              'group-hover:text-white/70',
              isOpen && 'rotate-180 text-[var(--app-tone-3)]',
            ),
          )}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          className={clsx(
            'absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto custom-scrollbar',
            'rounded-xl p-1 shadow-2xl shadow-black/80',
            'bg-[var(--app-tone-5,#070714)]/95 backdrop-blur-2xl border border-[var(--app-tone-3,#6366f1)]/30',
            'animate-in fade-in zoom-in-95 duration-150 origin-top',
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            const OptionIcon = option.icon;

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                className={twMerge(
                  clsx(
                    'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors select-none',
                    option.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                    isSelected
                      ? 'bg-[var(--app-tone-3)]/20 text-[var(--app-tone-1,#f0fdf9)] font-medium'
                      : isHighlighted
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/80 hover:bg-[var(--app-tone-3)]/15 hover:text-white',
                  ),
                )}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {OptionIcon && (
                    <OptionIcon
                      className={clsx(
                        'w-3.5 h-3.5 shrink-0 mt-0.5',
                        isSelected ? 'text-[var(--app-tone-3)]' : 'text-white/50',
                      )}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate leading-snug">{option.label}</div>
                    {option.description && (
                      <div className="text-[10px] text-white/45 truncate leading-tight mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[var(--app-tone-3)] shrink-0 ml-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

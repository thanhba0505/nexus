import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  isLoading?: boolean;
  badge?: string;
}

export interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
  className?: string;
}

export function DropdownMenu({
  isOpen,
  onClose,
  items,
  className = 'top-16 right-6',
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={clsx(
        'absolute z-50 min-w-56 rounded-2xl p-1.5 shadow-2xl',
        'bg-slate-900/90 backdrop-blur-2xl border border-white/15',
        'animate-in fade-in zoom-in-95 duration-150',
        className,
      )}
    >
      <div className="flex flex-col space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.disabled || item.isLoading) return;
              item.onClick();
              onClose();
            }}
            disabled={item.disabled || item.isLoading}
            className={clsx(
              'flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-xl transition-all',
              item.disabled
                ? 'opacity-40 cursor-not-allowed text-white/50'
                : item.variant === 'danger'
                  ? 'text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30'
                  : item.variant === 'primary'
                    ? 'text-indigo-300 hover:bg-indigo-500/20 active:bg-indigo-500/30 font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15',
            )}
          >
            <div className="flex items-center space-x-2.5">
              {item.isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                item.icon && (
                  <span className="w-3.5 h-3.5 flex items-center justify-center">{item.icon}</span>
                )
              )}
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

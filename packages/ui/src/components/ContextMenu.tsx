import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode | undefined;
  onClick: () => void;
  disabled?: boolean | undefined;
  tooltip?: string | undefined;
  variant?: ('default' | 'primary' | 'danger') | undefined;
  isLoading?: boolean | undefined;
}

export interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
}

export function ContextMenu({ isOpen, x, y, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Adjust position to stay within window boundaries
    const menuWidth = 200;
    const menuHeight = items.length * 36 + 16;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let posX = x;
    let posY = y;

    if (posX + menuWidth > windowWidth - 16) {
      posX = windowWidth - menuWidth - 16;
    }
    if (posY + menuHeight > windowHeight - 16) {
      posY = windowHeight - menuHeight - 16;
    }

    setAdjustedPos({ x: Math.max(16, posX), y: Math.max(16, posY) });
  }, [isOpen, x, y, items.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
      className={clsx(
        'fixed z-50 min-w-48 rounded-2xl p-1.5 shadow-2xl',
        'bg-slate-900/90 backdrop-blur-2xl border border-white/15',
        'animate-in fade-in zoom-in-95 duration-100',
      )}
    >
      <div className="flex flex-col space-y-0.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
          >
            <button
              onClick={() => {
                if (item.disabled || item.isLoading) return;
                item.onClick();
                onClose();
              }}
              disabled={item.disabled || item.isLoading}
              className={clsx(
                'flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-medium rounded-xl transition-all',
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-white/40'
                  : item.variant === 'danger'
                    ? 'text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30'
                    : item.variant === 'primary'
                      ? 'text-indigo-300 hover:bg-indigo-500/20 active:bg-indigo-500/30 font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15',
              )}
            >
              {item.isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                item.icon && (
                  <span className="w-3.5 h-3.5 flex items-center justify-center">{item.icon}</span>
                )
              )}
              <span>{item.label}</span>
            </button>

            {/* Tooltip if disabled and hovered */}
            {item.disabled && item.tooltip && hoveredItemId === item.id && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-amber-500/95 text-slate-950 font-semibold text-[11px] rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in">
                {item.tooltip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

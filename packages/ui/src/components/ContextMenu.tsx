import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Tính toán vị trí đồng bộ ngay lập tức để không bị trễ 1 frame (tránh nhảy từ (0, 0) hay vị trí cũ)
  const adjustedPos = useMemo(() => {
    const menuWidth = 200;
    const menuHeight = items.length * 36 + 16;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    let posX = x;
    let posY = y;

    if (posX + menuWidth > windowWidth - 16) {
      posX = windowWidth - menuWidth - 16;
    }
    if (posY + menuHeight > windowHeight - 16) {
      posY = windowHeight - menuHeight - 16;
    }

    return {
      x: Math.max(16, posX),
      y: Math.max(16, posY),
    };
  }, [x, y, items.length]);

  // Transform-origin xuất phát từ chính vị trí click chuột
  const originX = Math.max(0, Math.min(200, x - adjustedPos.x));
  const originY = Math.max(0, Math.min(items.length * 36 + 16, y - adjustedPos.y));

  // Tinh chỉnh bằng DOM thực tế trước khi paint (nếu menu dài hơn ước tính)
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let needAdjust = false;
    let posX = adjustedPos.x;
    let posY = adjustedPos.y;

    if (rect.right > windowWidth - 16) {
      posX = Math.max(16, windowWidth - rect.width - 16);
      needAdjust = true;
    }
    if (rect.bottom > windowHeight - 16) {
      posY = Math.max(16, windowHeight - rect.height - 16);
      needAdjust = true;
    }

    if (needAdjust) {
      menuRef.current.style.left = `${posX}px`;
      menuRef.current.style.top = `${posY}px`;
    }
  }, [isOpen, adjustedPos.x, adjustedPos.y]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop overlay: đóng ngay ở lần click đầu tiên và ngăn click-through xuống icon bên dưới */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />

      <div
        ref={menuRef}
        style={{
          left: adjustedPos.x,
          top: adjustedPos.y,
          transformOrigin: `${originX}px ${originY}px`,
        }}
        className={clsx(
          'fixed z-50 min-w-48 rounded-2xl p-1.5 shadow-2xl',
          'bg-slate-900/90 backdrop-blur-2xl border border-white/15',
          'animate-menu-in',
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
                    <span className="w-3.5 h-3.5 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )
                )}
                <span>{item.label}</span>
              </button>

              {/* Tooltip if disabled and hovered */}
              {item.disabled && item.tooltip && hoveredItemId === item.id && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-amber-500/95 text-slate-950 font-semibold text-[11px] rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                  {item.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

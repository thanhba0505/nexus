import React, { useState, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface WindowControlsProps {
  /** Hành động khi bấm nút đóng: 'hide' (ẩn ngầm, mặc định) hoặc 'close' (tắt tiến trình) */
  closeAction?: 'hide' | 'close';
  /** Kiểu giao diện nút: 'tinted' (Đỏ/Vàng/Xanh chuẩn glass, mặc định) hoặc 'subtle' (kính tối trung tính) */
  variant?: 'tinted' | 'subtle';
  /** Callback tùy biến khi bấm nút đóng */
  onClose?: () => void;
  /** Callback tùy biến khi bấm nút thu nhỏ */
  onMinimize?: () => void;
  /** Callback tùy biến khi bấm nút phóng to/khôi phục */
  onMaximize?: () => void;
  /** ClassName bổ sung */
  className?: string;
}

export function WindowControls({
  closeAction = 'hide',
  variant = 'tinted',
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: WindowControlsProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    try {
      const appWindow = getCurrentWindow();
      void appWindow.isMaximized().then(setIsMaximized);
      void appWindow
        .onResized(() => {
          void appWindow.isMaximized().then(setIsMaximized);
        })
        .then((fn) => {
          unlisten = fn;
        });
    } catch {
      // Bỏ qua nếu chạy trong môi trường web/mock
    }

    return () => {
      unlisten?.();
    };
  }, []);

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClose) {
      onClose();
      return;
    }
    try {
      const appWindow = getCurrentWindow();
      if (closeAction === 'close') {
        await appWindow.close();
      } else {
        await appWindow.hide();
      }
    } catch (err) {
      console.error('Lỗi khi đóng cửa sổ:', err);
    }
  };

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onMinimize) {
      onMinimize();
      return;
    }
    try {
      await getCurrentWindow().minimize();
    } catch (err) {
      console.error('Lỗi khi thu nhỏ cửa sổ:', err);
    }
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onMaximize) {
      onMaximize();
      return;
    }
    try {
      await getCurrentWindow().toggleMaximize();
    } catch (err) {
      console.error('Lỗi khi phóng to cửa sổ:', err);
    }
  };

  const baseBtnStyle =
    'flex h-5 w-5 items-center justify-center rounded-md border transition-all active:scale-95 cursor-pointer';

  const styles =
    variant === 'tinted'
      ? {
          close:
            'border-rose-500/25 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:border-rose-500/40 hover:text-rose-200 active:bg-rose-500/35',
          minimize:
            'border-amber-500/25 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/40 hover:text-amber-200 active:bg-amber-500/35',
          maximize:
            'border-emerald-500/25 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500/40 hover:text-emerald-200 active:bg-emerald-500/35',
        }
      : {
          close:
            'border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-300 active:bg-rose-500/30',
          minimize:
            'border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.1] hover:border-white/20 hover:text-white active:bg-white/[0.14]',
          maximize:
            'border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.1] hover:border-white/20 hover:text-white active:bg-white/[0.14]',
        };

  return (
    <div
      data-no-drag
      data-tauri-drag-region="false"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      onMouseDown={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 ${className}`}
    >
      {/* Nút Đóng */}
      <button
        type="button"
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleClose}
        title="Đóng (⌘W)"
        className={`${baseBtnStyle} ${styles.close}`}
      >
        <X className="h-3 w-3 pointer-events-none" />
      </button>

      {/* Nút Thu nhỏ */}
      <button
        type="button"
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleMinimize}
        title="Thu nhỏ (⌘M)"
        className={`${baseBtnStyle} ${styles.minimize}`}
      >
        <Minus className="h-3 w-3 pointer-events-none" />
      </button>

      {/* Nút Phóng to / Khôi phục kích thước */}
      <button
        type="button"
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleMaximize}
        title={isMaximized ? 'Khôi phục kích thước' : 'Phóng to'}
        className={`${baseBtnStyle} ${styles.maximize}`}
      >
        {isMaximized ? (
          <Minimize2 className="h-2.5 w-2.5 pointer-events-none" />
        ) : (
          <Maximize2 className="h-2.5 w-2.5 pointer-events-none" />
        )}
      </button>
    </div>
  );
}

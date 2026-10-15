import React, { useState, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface WindowControlsProps {
  /** Hành động khi bấm nút đóng: 'hide' (ẩn ngầm, mặc định) hoặc 'close' (tắt tiến trình) */
  closeAction?: 'hide' | 'close';
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
    'flex h-5 w-5 items-center justify-center rounded-md text-white/40 transition-colors active:scale-95 cursor-pointer';

  return (
    <div
      data-no-drag
      data-tauri-drag-region="false"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      onMouseDown={(e) => e.stopPropagation()}
      className={`flex items-center gap-0.5 ${className}`}
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
        className={`${baseBtnStyle} hover:bg-rose-500/20 hover:text-rose-300 active:bg-rose-500/30`}
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
        className={`${baseBtnStyle} hover:bg-white/[0.08] hover:text-white/80 active:bg-white/[0.12]`}
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
        className={`${baseBtnStyle} hover:bg-white/[0.08] hover:text-white/80 active:bg-white/[0.12]`}
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

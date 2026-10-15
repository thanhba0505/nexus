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

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    try {
      const appWindow = getCurrentWindow();
      if (closeAction === 'close') {
        void appWindow.close();
      } else {
        void appWindow.hide();
      }
    } catch {
      // Fallback khi chạy ngoài Tauri
    }
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
      return;
    }
    try {
      void getCurrentWindow().minimize();
    } catch {
      // Fallback khi chạy ngoài Tauri
    }
  };

  const handleMaximize = () => {
    if (onMaximize) {
      onMaximize();
      return;
    }
    try {
      void getCurrentWindow().toggleMaximize();
    } catch {
      // Fallback khi chạy ngoài Tauri
    }
  };

  const baseBtnStyle =
    'flex h-5 w-5 items-center justify-center rounded-md text-white/40 transition-colors active:scale-95 cursor-pointer';

  return (
    <div
      data-no-drag
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className={`flex items-center gap-0.5 ${className}`}
    >
      {/* Nút Đóng */}
      <button
        onClick={handleClose}
        title="Đóng (⌘W)"
        className={`${baseBtnStyle} hover:bg-rose-500/20 hover:text-rose-300 active:bg-rose-500/30`}
      >
        <X className="h-3 w-3" />
      </button>

      {/* Nút Thu nhỏ */}
      <button
        onClick={handleMinimize}
        title="Thu nhỏ (⌘M)"
        className={`${baseBtnStyle} hover:bg-white/[0.08] hover:text-white/80 active:bg-white/[0.12]`}
      >
        <Minus className="h-3 w-3" />
      </button>

      {/* Nút Phóng to / Khôi phục kích thước */}
      <button
        onClick={handleMaximize}
        title={isMaximized ? 'Khôi phục kích thước' : 'Phóng to'}
        className={`${baseBtnStyle} hover:bg-white/[0.08] hover:text-white/80 active:bg-white/[0.12]`}
      >
        {isMaximized ? (
          <Minimize2 className="h-2.5 w-2.5" />
        ) : (
          <Maximize2 className="h-2.5 w-2.5" />
        )}
      </button>
    </div>
  );
}

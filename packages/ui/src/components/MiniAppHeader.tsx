import React from 'react';
import { WindowControls } from './WindowControls';

export interface MiniAppHeaderProps {
  /** Hiển thị nút điều khiển cửa sổ tùy biến (mặc định true) */
  showWindowControls?: boolean;
  /** Vị trí nút điều khiển cửa sổ: 'left' (mặc định) hoặc 'right' */
  windowControlsPosition?: 'left' | 'right';
  /** Tùy chọn đóng: 'hide' (ẩn) hoặc 'close' (tắt tiến trình) */
  closeAction?: 'hide' | 'close';
  /** Kiểu giao diện nút điều khiển: 'tinted' (mặc định) hoặc 'subtle' */
  windowControlsVariant?: 'tinted' | 'subtle';
  /** Khoảng trống an toàn bên trái khi dùng Traffic Lights gốc của macOS (mặc định 0 khi dùng showWindowControls) */
  leftSafeWidth?: number;
  /** Vùng chứa các nút điều khiển bên trái (ví dụ logo, tiêu đề, filter) */
  leftSlot?: React.ReactNode;
  /** Tiêu đề trung tâm hoặc nội dung giữa header */
  centerSlot?: React.ReactNode;
  /** Vùng chứa các nút thao tác bên phải (ví dụ nút Làm mới, Sao chép, Cài đặt) */
  rightSlot?: React.ReactNode;
  /** Tùy biến className bổ sung */
  className?: string;
  /** Custom click handler cho header nếu cần */
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function MiniAppHeader({
  showWindowControls = true,
  windowControlsPosition = 'left',
  windowControlsVariant = 'tinted',
  closeAction = 'hide',
  leftSafeWidth = 0,
  leftSlot,
  centerSlot,
  rightSlot,
  className = '',
  onMouseDown,
}: MiniAppHeaderProps) {
  const controls = (
    <WindowControls
      closeAction={closeAction}
      variant={windowControlsVariant}
      className={windowControlsPosition === 'left' ? 'mr-1' : 'ml-1.5'}
    />
  );

  return (
    <header
      data-tauri-drag-region
      onMouseDown={onMouseDown}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className={`w-full h-[38px] px-3 flex items-center justify-between border-b border-white/[0.08] bg-slate-900 select-none z-30 shrink-0 ${className}`}
    >
      {/* Vùng bên trái: Window Controls (nếu position = left) + leftSlot */}
      <div
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center space-x-2 shrink-0 h-full"
      >
        {showWindowControls && windowControlsPosition === 'left' && (
          <div className="flex items-center gap-2 shrink-0">
            {controls}
            <div className="h-3.5 w-[1px] bg-white/[0.08]" />
          </div>
        )}
        {!showWindowControls && leftSafeWidth > 0 && (
          <div
            style={{ width: `${leftSafeWidth}px` }}
            className="shrink-0 pointer-events-none h-full"
          />
        )}
        <div className="flex items-center">{leftSlot}</div>
      </div>

      {/* Vùng ở giữa: Tiêu đề hoặc widget trung tâm, toàn bộ diện tích trống xung quanh đều kéo được */}
      {centerSlot ? (
        <div
          data-tauri-drag-region
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          className="flex-1 flex items-center justify-center min-w-0 px-2 h-full"
        >
          <div
            data-no-drag
            data-tauri-drag-region="false"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="shrink-0"
          >
            {centerSlot}
          </div>
        </div>
      ) : (
        <div
          data-tauri-drag-region
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          className="flex-1 h-full"
        />
      )}

      {/* Vùng bên phải: Các nút hành động + Window Controls (nếu position = right) */}
      <div
        data-no-drag
        data-tauri-drag-region="false"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center space-x-1.5 shrink-0 h-full"
      >
        {rightSlot}
        {showWindowControls && windowControlsPosition === 'right' && controls}
      </div>
    </header>
  );
}

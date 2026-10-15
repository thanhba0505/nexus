import React from 'react';

export interface MiniAppHeaderProps {
  /** Khoảng trống an toàn bên trái để chừa cho 3 nút Traffic Lights gốc của macOS (mặc định 76px) */
  leftSafeWidth?: number;
  /** Vùng chứa các nút điều khiển bên trái (ví dụ bộ chọn ngày, danh mục, filter) */
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
  leftSafeWidth = 76,
  leftSlot,
  centerSlot,
  rightSlot,
  className = '',
  onMouseDown,
}: MiniAppHeaderProps) {
  return (
    <header
      data-tauri-drag-region
      onMouseDown={onMouseDown}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className={`w-full h-[38px] px-3 flex items-center justify-between border-b border-white/[0.08] bg-slate-900/60 backdrop-blur-xl select-none z-30 shrink-0 ${className}`}
    >
      {/* Vùng bên trái: Khoảng an toàn traffic lights + leftSlot */}
      <div
        data-tauri-drag-region
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className="flex items-center space-x-2 shrink-0 h-full"
      >
        {/* Khoảng trống không che nút đỏ/vàng/xanh của macOS (cho phép kéo nếu click vào đây) */}
        <div
          data-tauri-drag-region
          style={{ width: `${leftSafeWidth}px` }}
          className="shrink-0 pointer-events-none h-full"
        />
        <div data-tauri-drag-region className="flex items-center">
          {leftSlot}
        </div>
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

      {/* Vùng bên phải: Các nút hành động */}
      {rightSlot && (
        <div
          data-tauri-drag-region
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          className="flex items-center space-x-1.5 shrink-0 h-full"
        >
          {rightSlot}
        </div>
      )}
    </header>
  );
}

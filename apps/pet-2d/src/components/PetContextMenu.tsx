import { useEffect, useRef } from 'react';
import { PetConfig, PetScale, PetSpeed } from '../types/pet';
import { Maximize2, Gauge, Pause, Play, Compass, FolderPlus, Pin, X, Check } from 'lucide-react';

interface PetContextMenuProps {
  x: number;
  y: number;
  config: PetConfig;
  onUpdateConfig: (updater: (prev: PetConfig) => PetConfig) => void;
  onResetPosition: () => void;
  onOpenCustomPack: () => void;
  onCloseApp: () => void;
  onDismiss: () => void;
}

export function PetContextMenu({
  x,
  y,
  config,
  onUpdateConfig,
  onResetPosition,
  onOpenCustomPack,
  onCloseApp,
  onDismiss,
}: PetContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [onDismiss]);

  const handleSetScale = (scale: PetScale) => {
    onUpdateConfig((prev) => ({ ...prev, scale }));
  };

  const handleSetSpeed = (speed: PetSpeed) => {
    onUpdateConfig((prev) => ({ ...prev, speed }));
  };

  const togglePause = () => {
    onUpdateConfig((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const toggleAlwaysOnTop = () => {
    onUpdateConfig((prev) => ({ ...prev, isAlwaysOnTop: !prev.isAlwaysOnTop }));
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.min(x, 60)}px`, top: `${Math.min(y, 40)}px` }}
      className="absolute z-50 w-52 rounded-xl bg-[#041915]/95 backdrop-blur-xl border border-[#00c49a]/35 p-1.5 shadow-2xl text-xs text-[#f0fdf9] select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Title */}
      <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#00c49a] border-b border-[#00c49a]/20 mb-1 flex items-center justify-between">
        <span>🐾 2D Pet Menu</span>
        <span className="text-[#5eead4]/60 font-mono">v0.4.0</span>
      </div>

      {/* Scale controls */}
      <div className="px-2 py-1">
        <div className="flex items-center gap-1.5 text-[#5eead4] mb-1">
          <Maximize2 className="w-3.5 h-3.5 text-[#00c49a]" />
          <span>Kích thước:</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-[#031411]/80 border border-[#00c49a]/20 p-0.5 rounded-lg">
          {([1, 1.5, 2] as PetScale[]).map((s) => (
            <button
              key={s}
              onClick={() => handleSetScale(s)}
              className={`py-0.5 text-center rounded text-[11px] font-medium transition-colors ${
                config.scale === s
                  ? 'bg-[#00c49a] text-[#031411] font-bold shadow-xs'
                  : 'hover:bg-[#00c49a]/15 text-[#5eead4]/80 hover:text-[#f0fdf9]'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Speed controls */}
      <div className="px-2 py-1">
        <div className="flex items-center gap-1.5 text-[#5eead4] mb-1">
          <Gauge className="w-3.5 h-3.5 text-[#00c49a]" />
          <span>Tốc độ:</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-[#031411]/80 border border-[#00c49a]/20 p-0.5 rounded-lg">
          {(['slow', 'normal', 'fast'] as PetSpeed[]).map((spd) => (
            <button
              key={spd}
              onClick={() => handleSetSpeed(spd)}
              className={`py-0.5 text-center capitalize rounded text-[10px] transition-colors ${
                config.speed === spd
                  ? 'bg-[#00c49a] text-[#031411] shadow-xs font-bold'
                  : 'hover:bg-[#00c49a]/15 text-[#5eead4]/80 hover:text-[#f0fdf9]'
              }`}
            >
              {spd === 'slow' ? 'Chậm' : spd === 'normal' ? 'Chuẩn' : 'Nhanh'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#00c49a]/15 my-1" />

      {/* Actions */}
      <button
        onClick={togglePause}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#00c49a]/15 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          {config.isPaused ? (
            <Play className="w-3.5 h-3.5 text-[#00c49a]" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{config.isPaused ? 'Tiếp tục di chuyển' : 'Tạm dừng (Đứng yên)'}</span>
        </span>
        {config.isPaused && <Check className="w-3 h-3 text-[#00c49a]" />}
      </button>

      <button
        onClick={() => {
          onResetPosition();
          onDismiss();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#00c49a]/15 transition-colors text-left"
      >
        <Compass className="w-3.5 h-3.5 text-[#00c49a]" />
        <span>Đưa về giữa màn hình</span>
      </button>

      <button
        onClick={toggleAlwaysOnTop}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#00c49a]/15 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          <Pin className="w-3.5 h-3.5 text-teal-400" />
          <span>Luôn nổi trên cùng</span>
        </span>
        {config.isAlwaysOnTop && <Check className="w-3 h-3 text-[#00c49a]" />}
      </button>

      <button
        onClick={() => {
          onOpenCustomPack();
          onDismiss();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#00c49a]/15 transition-colors text-left"
      >
        <FolderPlus className="w-3.5 h-3.5 text-[#00c49a]" />
        <span>Đổi nhân vật (Import)...</span>
      </button>

      <div className="h-px bg-[#00c49a]/15 my-1" />

      {/* Quit */}
      <button
        onClick={onCloseApp}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors text-left"
      >
        <X className="w-3.5 h-3.5" />
        <span>Đóng 2D Pet</span>
      </button>
    </div>
  );
}

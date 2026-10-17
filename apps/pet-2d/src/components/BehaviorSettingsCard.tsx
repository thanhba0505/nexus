import { PetConfig, PetScale, PetSpeed } from '../types/pet';
import { Sliders, Maximize2, Gauge, Shield, Zap, Sparkles } from 'lucide-react';

interface BehaviorSettingsCardProps {
  config: PetConfig;
  onUpdateConfig: (updater: (prev: PetConfig) => PetConfig) => void;
}

export function BehaviorSettingsCard({ config, onUpdateConfig }: BehaviorSettingsCardProps) {
  const handleSetScale = (scale: PetScale) => {
    onUpdateConfig((prev) => ({ ...prev, scale }));
  };

  const handleSetSpeed = (speed: PetSpeed) => {
    onUpdateConfig((prev) => ({ ...prev, speed }));
  };

  const toggleGravity = () => {
    onUpdateConfig((prev) => ({ ...prev, enableGravity: !prev.enableGravity }));
  };

  const toggleWallClimb = () => {
    onUpdateConfig((prev) => ({ ...prev, enableWallClimb: !prev.enableWallClimb }));
  };

  const toggleAlwaysOnTop = () => {
    onUpdateConfig((prev) => ({ ...prev, isAlwaysOnTop: !prev.isAlwaysOnTop }));
  };

  const toggleAutoSpawn = () => {
    onUpdateConfig((prev) => ({ ...prev, autoSpawnOnLaunch: !prev.autoSpawnOnLaunch }));
  };

  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082620]/85 via-[#061c18]/90 to-[#031411]/95 border border-[#00c49a]/30 p-4.5 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00c49a]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3.5 relative z-10">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00c49a]/35 bg-[#00c49a]/15 text-[#00c49a] shadow-xs">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#f0fdf9]">
            Cấu Hình Hành Vi & Vật Lý (Settings)
          </h3>
          <p className="text-[11px] text-[#5eead4]/70">
            Điều chỉnh tốc độ, tỷ lệ hiển thị và cơ chế tương tác màn hình
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
        {/* Left Column: Scale & Speed */}
        <div className="space-y-3.5">
          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs text-[#5eead4]">
                <Maximize2 className="w-3.5 h-3.5 text-[#00c49a]" />
                <span>Kích thước nhân vật:</span>
              </span>
              <span className="text-xs font-mono text-[#00c49a] font-semibold">
                {config.scale}x ({Math.round(120 * config.scale)}px)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-[#041613]/85 border border-[#00c49a]/20 p-1 rounded-xl">
              {([1, 1.5, 2] as PetScale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSetScale(s)}
                  className={`py-1.5 text-center rounded-lg text-xs font-medium transition-all ${
                    config.scale === s
                      ? 'bg-[#00c49a] text-[#031411] font-bold shadow-md shadow-[#00c49a]/25'
                      : 'hover:bg-[#00c49a]/15 text-[#5eead4]/75 hover:text-[#f0fdf9]'
                  }`}
                >
                  {s === 1 ? '1.0x (Nhỏ)' : s === 1.5 ? '1.5x (Chuẩn)' : '2.0x (Lớn)'}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs text-[#5eead4]">
                <Gauge className="w-3.5 h-3.5 text-[#00c49a]" />
                <span>Tốc độ di chuyển:</span>
              </span>
              <span className="text-xs font-mono text-[#00c49a] font-semibold capitalize">
                {config.speed === 'slow' ? 'Chậm' : config.speed === 'normal' ? 'Chuẩn' : 'Nhanh'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-[#041613]/85 border border-[#00c49a]/20 p-1 rounded-xl">
              {(['slow', 'normal', 'fast'] as PetSpeed[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSetSpeed(spd)}
                  className={`py-1.5 text-center rounded-lg text-xs font-medium transition-all ${
                    config.speed === spd
                      ? 'bg-[#00c49a] text-[#031411] font-bold shadow-md shadow-[#00c49a]/25'
                      : 'hover:bg-[#00c49a]/15 text-[#5eead4]/75 hover:text-[#f0fdf9]'
                  }`}
                >
                  {spd === 'slow' ? 'Chậm' : spd === 'normal' ? 'Chuẩn' : 'Nhanh'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Physics & macOS Toggles */}
        <div className="space-y-2.5">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 hover:border-[#00c49a]/45 hover:bg-[#082620]/80 cursor-pointer transition-all">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-[#f0fdf9]">Gia tốc trọng lực (Gravity)</p>
                <p className="text-[10px] text-[#5eead4]/75">Rơi tự do và nảy nhẹ khi tiếp đất</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.enableGravity}
              onChange={toggleGravity}
              className="w-4 h-4 rounded accent-[#00c49a] text-[#00c49a] focus:ring-0 bg-[#031411] border-[#00c49a]/30"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 hover:border-[#00c49a]/45 hover:bg-[#082620]/80 cursor-pointer transition-all">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00c49a]" />
              <div>
                <p className="text-xs font-medium text-[#f0fdf9]">Leo trèo mép màn hình</p>
                <p className="text-[10px] text-[#5eead4]/75">Trèo lên viền trái/phải và nhảy dù</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.enableWallClimb}
              onChange={toggleWallClimb}
              className="w-4 h-4 rounded accent-[#00c49a] text-[#00c49a] focus:ring-0 bg-[#031411] border-[#00c49a]/30"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 hover:border-[#00c49a]/45 hover:bg-[#082620]/80 cursor-pointer transition-all">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <div>
                <p className="text-xs font-medium text-[#f0fdf9]">Luôn nổi trên cùng</p>
                <p className="text-[10px] text-[#5eead4]/75">Hiển thị đè lên các cửa sổ khác</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.isAlwaysOnTop}
              onChange={toggleAlwaysOnTop}
              className="w-4 h-4 rounded accent-[#00c49a] text-[#00c49a] focus:ring-0 bg-[#031411] border-[#00c49a]/30"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 hover:border-[#00c49a]/45 hover:bg-[#082620]/80 cursor-pointer transition-all">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#00c49a]" />
              <div>
                <p className="text-xs font-medium text-[#f0fdf9]">Tự động thả Pet khi mở app</p>
                <p className="text-[10px] text-[#5eead4]/75">Tự bật pet ra desktop lúc khởi chạy</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.autoSpawnOnLaunch}
              onChange={toggleAutoSpawn}
              className="w-4 h-4 rounded accent-[#00c49a] text-[#00c49a] focus:ring-0 bg-[#031411] border-[#00c49a]/30"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

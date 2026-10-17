import { PetConfig, PetItem, PetTelemetry } from '../types/pet';
import { Sparkles, Compass, Pause, Play, EyeOff } from 'lucide-react';
import { ContentCard } from '@nexus/ui';

interface PetHeroCardProps {
  config: PetConfig;
  activePet: PetItem | undefined;
  telemetry: PetTelemetry;
  isSpawned: boolean;
  onToggleSpawn: () => void;
  onResetPosition: () => void;
  onTogglePause: () => void;
}

export function PetHeroCard({
  config,
  activePet,
  telemetry,
  isSpawned,
  onToggleSpawn,
  onResetPosition,
  onTogglePause,
}: PetHeroCardProps) {
  return (
    <ContentCard variant="acrylic" padding="md" className="relative shrink-0 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00c49a]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4.5 relative z-10">
        {/* Left: Animated Avatar */}
        <div className="relative w-20 h-20 rounded-2xl bg-[#041613]/90 border border-[#00c49a]/30 flex items-center justify-center p-2 shadow-inner group shrink-0">
          <img
            src={activePet?.previewUrl || '/sprites/default/shime1.png'}
            alt={activePet?.name || 'Pet'}
            className="w-16 h-16 object-contain filter drop-shadow(0 4px 8px rgba(0,0,0,0.5)) transition-transform duration-200 group-hover:scale-110"
            style={{
              transform: telemetry.direction === 'left' ? 'scaleX(-1)' : 'none',
            }}
          />
          {isSpawned && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c49a] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00c49a] border-2 border-[#031411]" />
            </span>
          )}
        </div>

        {/* Right: Info & Controls */}
        <div className="min-w-0 flex-1">
          {/* Dòng 1: Tên Pet + Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-[#f0fdf9] tracking-tight">
              {activePet?.name || 'Anya Forger (Chibi)'}
            </h2>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isSpawned
                  ? 'bg-[#00c49a]/20 text-[#00c49a] border-[#00c49a]/40 shadow-xs'
                  : 'bg-[#061c18]/80 text-[#5eead4]/60 border-[#00c49a]/20'
              }`}
            >
              {isSpawned ? 'Đang hoạt động' : 'Đã thu hồi'}
            </span>
          </div>

          {/* Dòng 2: Mô tả nhân vật */}
          <p className="text-xs text-[#5eead4]/80 line-clamp-1 mb-2.5">
            {activePet?.description || 'Nhân vật hoạt ảnh 13 frames chuẩn Shimeji'}
          </p>

          {/* Dòng 3: Cụm nút hành động */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              onClick={onResetPosition}
              disabled={!isSpawned}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061c18]/90 hover:bg-[#0c332b] disabled:opacity-40 text-xs font-medium text-[#f0fdf9] border border-[#00c49a]/25 hover:border-[#00c49a]/50 shadow-sm transition-all"
              title="Đưa nhân vật về giữa màn hình nếu bị khuất"
            >
              <Compass className="w-3.5 h-3.5 text-[#00c49a]" />
              <span>Về giữa</span>
            </button>

            <button
              onClick={onTogglePause}
              disabled={!isSpawned}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061c18]/90 hover:bg-[#0c332b] disabled:opacity-40 text-xs font-medium text-[#f0fdf9] border border-[#00c49a]/25 hover:border-[#00c49a]/50 shadow-sm transition-all"
            >
              {config.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-[#00c49a]" />
                  <span>Tiếp tục</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ghim vị trí</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleSpawn}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
                isSpawned
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110 shadow-rose-950/50'
                  : 'bg-gradient-to-r from-[#00c49a] to-teal-500 text-[#031411] font-bold hover:brightness-110 shadow-[0_4px_16px_rgba(0,196,154,0.35)]'
              }`}
            >
              {isSpawned ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Thu hồi Pet</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Thả Pet ra màn hình</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ContentCard>
  );
}

import { useState, useEffect } from 'react';
import {
  AppLayout,
  AppSidebar,
  ContentCard,
  AppButton,
  MiniAppHeader,
  MiniAppStatusBar,
  useHotkeys,
} from '@nexus/ui';
import {
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  Layers,
  Sliders,
  Maximize2,
  Activity,
  ArrowRight,
  Move,
  Info,
} from 'lucide-react';
import { PetConfig, PetItem, PetTelemetry } from '../types/pet';
import { petApi, DEFAULT_CONFIG } from '../services/pet-api';
import { PetHeroCard } from './PetHeroCard';
import { PetGallery } from './PetGallery';
import { PetUploader } from './PetUploader';
import { BehaviorSettingsCard } from './BehaviorSettingsCard';
import { emit, listen } from '@tauri-apps/api/event';

export type DashboardTab = 'overview' | 'gallery' | 'settings';

interface TabDefinition {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const TABS: TabDefinition[] = [
  { id: 'overview', label: 'Tổng quan', icon: Sparkles, shortcut: '⌘1' },
  { id: 'gallery', label: 'Thư viện Pet', icon: Layers, shortcut: '⌘2' },
  { id: 'settings', label: 'Cài đặt & Vật lý', icon: Sliders, shortcut: '⌘3' },
];

const STATE_VI_MAP: Record<string, string> = {
  idle: 'Đang quan sát',
  walking: 'Đang đi dạo',
  falling: 'Rơi tự do',
  dragged: 'Bị nhấc bổng',
  climbing: 'Đang leo tường',
  sitting: 'Đang ngồi nghỉ',
};

export function DashboardView() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [config, setConfig] = useState<PetConfig>(DEFAULT_CONFIG);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [isSpawned, setIsSpawned] = useState(true);
  const [telemetry, setTelemetry] = useState<PetTelemetry>({
    state: 'idle',
    x: 400,
    y: 600,
    direction: 'right',
  });

  // Hotkeys to switch tabs: ⌘1, ⌘2, ⌘3
  useHotkeys({
    'mod+1': () => setActiveTab('overview'),
    'mod+2': () => setActiveTab('gallery'),
    'mod+3': () => setActiveTab('settings'),
  });

  // Load initial settings and pet library
  useEffect(() => {
    let mounted = true;

    petApi.loadSettings().then((saved) => {
      if (!mounted) return;
      setConfig(saved);
      setIsSpawned(saved.isSpawned);
      if (saved.isSpawned && saved.autoSpawnOnLaunch) {
        petApi.spawnPetWindow();
      }
    });

    petApi.getPetLibrary().then((list) => {
      if (!mounted) return;
      setPets(list);
    });

    petApi.isPetSpawned().then((spawned) => {
      if (!mounted) return;
      setIsSpawned(spawned);
    });

    // Listen to telemetry updates from pet-overlay
    const unlistenTelemetry = listen<PetTelemetry>('pet-telemetry', (event) => {
      setTelemetry(event.payload);
    });

    return () => {
      mounted = false;
      unlistenTelemetry.then((fn) => fn());
    };
  }, []);

  const handleUpdateConfig = (updater: (prev: PetConfig) => PetConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      petApi.saveSettings(next);
      emit('pet-config-updated', next).catch(() => {});
      return next;
    });
  };

  const handleToggleSpawn = async () => {
    if (isSpawned) {
      await petApi.closePetWindow();
      setIsSpawned(false);
      handleUpdateConfig((prev) => ({ ...prev, isSpawned: false }));
    } else {
      await petApi.spawnPetWindow();
      setIsSpawned(true);
      handleUpdateConfig((prev) => ({ ...prev, isSpawned: true }));
    }
  };

  const handleSelectPet = (petId: string) => {
    handleUpdateConfig((prev) => ({ ...prev, activePetId: petId }));
  };

  const handleDeletePet = async (petId: string) => {
    await petApi.deleteCustomPet(petId);
    const updated = await petApi.getPetLibrary();
    setPets(updated);
    if (config.activePetId === petId) {
      handleSelectPet('anya');
    }
  };

  const handlePetImported = (newPet: PetItem) => {
    setPets((prev) => [...prev, newPet]);
    handleSelectPet(newPet.id);
  };

  const handleResetPosition = () => {
    emit('pet-action', 'center').catch(() => {});
  };

  const handleTogglePause = () => {
    handleUpdateConfig((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const activePet = pets.find((p) => p.id === config.activePetId) || pets[0];

  return (
    <AppLayout
      theme="pet-2d"
      header={
        <MiniAppHeader
          className="border-b border-[#00c49a]/20 bg-[#051b17]/90 backdrop-blur-md"
          leftSlot={
            <div data-tauri-drag-region className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#00c49a]/35 bg-[#00c49a]/15 text-[#00c49a] shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span data-tauri-drag-region className="text-xs font-semibold text-[#f0fdf9]">
                2D Pet Control Center
              </span>
              <span className="rounded bg-[#00c49a]/15 border border-[#00c49a]/30 px-1.5 py-0.5 text-[10px] font-mono text-[#00c49a]">
                v0.5.0
              </span>
            </div>
          }
          rightSlot={
            <div
              data-no-drag
              data-tauri-drag-region="false"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              className="flex items-center gap-2"
            >
              <AppButton
                size="sm"
                variant={isSpawned ? 'secondary' : 'ghost'}
                onClick={handleToggleSpawn}
                icon={isSpawned ? Eye : EyeOff}
              >
                {isSpawned ? 'Pet: Đang bật' : 'Pet: Đã tắt'}
              </AppButton>

              <AppButton
                size="icon"
                variant="ghost"
                onClick={handleResetPosition}
                disabled={!isSpawned}
                title="Đưa Pet về giữa màn hình"
                icon={RotateCcw}
              />
            </div>
          }
        />
      }
      sidebar={
        <AppSidebar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as DashboardTab)}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
          title="Điều Hướng"
        />
      }
      footer={
        <MiniAppStatusBar
          className="border-t border-[#00c49a]/20 bg-[#041814]/95 text-[#5eead4]/80"
          message={`2D Pet • ${activePet?.name || 'Anya'} (${isSpawned ? 'Đang thả trên desktop' : 'Đã thu hồi'})`}
          tone={isSpawned ? 'success' : 'default'}
          rightSlot={
            <span className="text-[#5eead4]/70 font-mono text-[10px]">
              {pets.length} nhân vật • Cổng 1423
            </span>
          }
        />
      }
      mainClassName="p-4.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar"
    >
      {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 1. Hero Live Status & Master Switch */}
          <PetHeroCard
            config={config}
            activePet={activePet}
            telemetry={telemetry}
            isSpawned={isSpawned}
            onToggleSpawn={handleToggleSpawn}
            onResetPosition={handleResetPosition}
            onTogglePause={handleTogglePause}
          />

          {/* 2. Standardized Live Telemetry Container Card */}
          <ContentCard
            title="Chỉ Số Giám Sát Thời Gian Thực"
            icon={Activity}
            badge="Auto-sync 120ms"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Telemetry Coords */}
              <div className="rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-[#5eead4] font-medium">
                    <Move className="w-3.5 h-3.5 text-[#00c49a]" />
                    <span>Tọa độ Desktop</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#00c49a] bg-[#00c49a]/15 px-1.5 py-0.5 rounded border border-[#00c49a]/30">
                    Live
                  </span>
                </div>
                <div className="font-mono text-sm font-semibold text-[#f0fdf9] mb-1">
                  X: {Math.round(telemetry.x)} <span className="text-[#14b8a6]/40">•</span> Y:{' '}
                  {Math.round(telemetry.y)}
                </div>
                <p className="text-[11px] text-[#2dd4bf]/75">
                  Hướng di chuyển:{' '}
                  <span className="text-[#5eead4] font-medium">
                    {telemetry.direction === 'left' ? '⬅️ Sang trái' : '➡️ Sang phải'}
                  </span>
                </p>
              </div>

              {/* State Monitor */}
              <div className="rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-[#5eead4] font-medium">
                    <Activity className="w-3.5 h-3.5 text-[#00c49a]" />
                    <span>Hành động Mascot</span>
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSpawned
                        ? 'bg-[#00c49a] shadow-[0_0_8px_rgba(0,196,154,0.6)]'
                        : 'bg-[#061c18]'
                    }`}
                  />
                </div>
                <div className="text-sm font-semibold text-[#f0fdf9] mb-1 truncate">
                  {isSpawned ? STATE_VI_MAP[telemetry.state] || telemetry.state : 'Đã thu hồi'}
                </div>
                <p className="text-[11px] text-[#2dd4bf]/75">
                  Hoạt ảnh:{' '}
                  <span className="text-[#5eead4] font-medium">
                    {activePet?.frameCount || 13} frames Shimeji
                  </span>
                </p>
              </div>

              {/* Active Profile */}
              <div className="rounded-xl bg-[#041613]/85 border border-[#00c49a]/20 p-3.5 backdrop-blur-md sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-[#5eead4] font-medium">
                    <Maximize2 className="w-3.5 h-3.5 text-[#00c49a]" />
                    <span>Hồ sơ kích thước</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#5eead4]/70">
                    {Math.round(120 * config.scale)}px
                  </span>
                </div>
                <div className="font-mono text-sm font-semibold text-[#f0fdf9] mb-1">
                  Tỷ lệ {config.scale}x <span className="text-[#14b8a6]/40">•</span> Tốc độ{' '}
                  {config.speed}
                </div>
                <p className="text-[11px] text-[#2dd4bf]/75">
                  Trọng lực:{' '}
                  <span className="text-[#5eead4] font-medium">
                    {config.enableGravity ? 'Bật (Gravity)' : 'Tắt'}
                  </span>
                </p>
              </div>
            </div>
          </ContentCard>

          {/* 3. Standardized Quick Navigation Container Card */}
          <ContentCard title="Chuyển Nhanh Phân Khu Chức Năng" icon={ArrowRight}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => setActiveTab('gallery')}
                className="group flex items-center justify-between p-4 rounded-xl bg-[#041613]/85 hover:bg-[#0c332b]/80 border border-[#00c49a]/20 hover:border-[#00c49a]/50 transition-all text-left shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#00c49a]/15 border border-[#00c49a]/30 flex items-center justify-center text-[#00c49a] group-hover:scale-105 transition-transform">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#f0fdf9] group-hover:text-[#00c49a] transition-colors">
                      Thư viện & Nhập nhân vật
                    </h4>
                    <p className="text-[11px] text-[#5eead4]/75">
                      Đang có {pets.length} nhân vật • Hỗ trợ Shimeji pack
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#5eead4]/60 group-hover:text-[#00c49a] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="group flex items-center justify-between p-4 rounded-xl bg-[#041613]/85 hover:bg-[#0c332b]/80 border border-[#00c49a]/20 hover:border-[#00c49a]/50 transition-all text-left shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#00c49a]/15 border border-[#00c49a]/30 flex items-center justify-center text-[#00c49a] group-hover:scale-105 transition-transform">
                    <Sliders className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#f0fdf9] group-hover:text-[#00c49a] transition-colors">
                      Cài đặt & Vật lý nâng cao
                    </h4>
                    <p className="text-[11px] text-[#5eead4]/75">
                      Tốc độ, leo trèo viền màn hình, luôn nổi
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#5eead4]/60 group-hover:text-[#00c49a] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </ContentCard>
        </div>
      )}

      {/* TAB 2: THƯ VIỆN PET (GALLERY & IMPORT) */}
      {activeTab === 'gallery' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <PetGallery
            pets={pets}
            activePetId={config.activePetId}
            onSelectPet={handleSelectPet}
            onDeletePet={handleDeletePet}
          />

          <PetUploader onPetImported={handlePetImported} />
        </div>
      )}

      {/* TAB 3: CÀI ĐẶT & VẬT LÝ (SETTINGS) */}
      {activeTab === 'settings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <BehaviorSettingsCard config={config} onUpdateConfig={handleUpdateConfig} />

          {/* Quick macOS Interaction Guide */}
          <ContentCard variant="acrylic">
            <div className="flex items-start gap-3.5 text-[#5eead4]/85">
              <Info className="w-4 h-4 text-[#00c49a] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-semibold text-[#f0fdf9]">Mẹo tương tác trên macOS:</span> Nhấp
                giữ chuột trái trực tiếp vào bé Pet ngoài Desktop để nhấc bổng và thả ở vị trí bất
                kỳ. Nhấp chuột phải vào nhân vật để mở nhanh menu điều khiển kích thước, tốc độ và
                tạm dừng bước đi.
              </div>
            </div>
          </ContentCard>
        </div>
      )}
    </AppLayout>
  );
}

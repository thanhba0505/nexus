import { useState, useEffect } from 'react';
import { MiniAppShell, MiniAppHeader, MiniAppStatusBar, useHotkeys } from '@nexus/ui';
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
  PanelLeftClose,
  PanelLeftOpen,
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
    <MiniAppShell
      className="border-[#00c49a]/30 bg-[#031411] text-[#f0fdf9] pet-ambient-canvas"
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
              <button
                onClick={handleToggleSpawn}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSpawned
                    ? 'bg-[#00c49a]/20 border-[#00c49a]/40 text-[#00c49a] hover:bg-[#00c49a]/30 shadow-xs'
                    : 'bg-[#061c18]/80 border-[#00c49a]/20 text-[#5eead4]/65 hover:text-[#f0fdf9] hover:bg-[#082620]'
                }`}
              >
                {isSpawned ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#00c49a]" />
                    <span>Pet: Đang bật</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-[#5eead4]/65" />
                    <span>Pet: Đã tắt</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetPosition}
                disabled={!isSpawned}
                className="p-1 rounded-lg text-[#5eead4]/70 hover:text-[#f0fdf9] hover:bg-[#00c49a]/15 disabled:opacity-30 transition-colors"
                title="Đưa Pet về giữa màn hình"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          }
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
      mainClassName="min-h-0 flex-1 overflow-hidden p-0"
    >
      <div className="flex h-full w-full min-h-0 flex-1 overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <aside
          className={`relative flex flex-col shrink-0 border-r border-[#00c49a]/20 bg-[#041814]/90 backdrop-blur-md z-20 transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? 'w-56' : 'w-16'
          }`}
        >
          {/* Sidebar Top: Toggle Button */}
          <div className="px-2 py-3 border-b border-[#00c49a]/15 shrink-0 flex items-center h-14">
            <button
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              className="group relative flex items-center w-full h-10 rounded-xl text-[#5eead4]/75 hover:text-[#f0fdf9] hover:bg-[#00c49a]/15 transition-colors"
              title={isSidebarExpanded ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
            >
              {/* Fixed Icon Anchor */}
              <div className="w-12 h-10 shrink-0 flex items-center justify-center">
                {isSidebarExpanded ? (
                  <PanelLeftClose className="w-4 h-4 text-[#00c49a] shrink-0" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4 text-[#00c49a] shrink-0" />
                )}
              </div>

              {/* Smooth Title Slide-out */}
              <div
                className={`flex items-center flex-1 min-w-0 pr-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
                  isSidebarExpanded
                    ? 'opacity-100 max-w-[160px] translate-x-0'
                    : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5eead4]/70 truncate">
                  Điều Hướng
                </span>
              </div>

              {/* Floating Tooltip in Collapsed Mode */}
              {!isSidebarExpanded && (
                <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg border border-[#00c49a]/40 bg-[#041915]/95 px-2.5 py-1 text-xs font-medium text-[#f0fdf9] shadow-2xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                  Mở rộng thanh bên
                </div>
              )}
            </button>
          </div>

          {/* Sidebar Navigation Items - overflow-visible ensures no scrollbar ever appears */}
          <div className="flex-1 px-2 py-3 space-y-1.5 overflow-visible">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="relative">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.label}
                    className={`group relative flex items-center w-full h-11 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#00c49a] text-[#031411] font-bold shadow-[0_2px_12px_rgba(0,196,154,0.45)]'
                        : 'text-[#7ee0cb]/75 hover:bg-[#00c49a]/15 hover:text-[#f0fdf9]'
                    }`}
                  >
                    {/* Fixed Icon Anchor */}
                    <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#031411] stroke-[2.5]' : 'text-[#00c49a]'
                        }`}
                      />
                    </div>

                    {/* Smooth Title Slide-out (Icon + Tab Name only when expanded) */}
                    <div
                      className={`flex items-center flex-1 min-w-0 pr-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
                        isSidebarExpanded
                          ? 'opacity-100 max-w-[160px] translate-x-0'
                          : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                      }`}
                    >
                      <span
                        className={`text-xs font-medium truncate tracking-tight ${
                          isActive ? 'text-[#031411] font-bold' : 'text-[#f0fdf9]'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>

                    {/* Floating Tooltip in Collapsed Mode */}
                    {!isSidebarExpanded && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg border border-[#00c49a]/40 bg-[#041915]/95 px-2.5 py-1 text-xs font-medium text-[#f0fdf9] shadow-2xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                        {tab.label}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar p-5 md:p-6 space-y-5">
          {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
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
              <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082620]/85 via-[#061c18]/90 to-[#031411]/95 border border-[#00c49a]/30 p-4.5 sm:p-5 shadow-2xl backdrop-blur-xl">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00c49a]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00c49a]" />
                    <h3 className="text-sm font-semibold text-[#f0fdf9]">
                      Chỉ Số Giám Sát Thời Gian Thực
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#00c49a] bg-[#00c49a]/15 px-2 py-0.5 rounded-full border border-[#00c49a]/30">
                    Auto-sync 120ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
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
              </div>

              {/* 3. Standardized Quick Navigation Container Card */}
              <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082620]/85 via-[#061c18]/90 to-[#031411]/95 border border-[#00c49a]/30 p-4.5 sm:p-5 shadow-2xl backdrop-blur-xl">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00c49a]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-3.5 relative z-10">
                  <ArrowRight className="w-4 h-4 text-[#00c49a]" />
                  <h3 className="text-sm font-semibold text-[#f0fdf9]">
                    Chuyển Nhanh Phân Khu Chức Năng
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="group flex items-center justify-between p-4 rounded-xl bg-[#041613]/85 hover:bg-[#0c332b]/80 border border-[#00c49a]/20 hover:border-[#00c49a]/50 transition-all text-left shadow-sm"
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
                    className="group flex items-center justify-between p-4 rounded-xl bg-[#041613]/85 hover:bg-[#0c332b]/80 border border-[#00c49a]/20 hover:border-[#00c49a]/50 transition-all text-left shadow-sm"
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
              </div>
            </div>
          )}

          {/* TAB 2: THƯ VIỆN PET (GALLERY & IMPORT) */}
          {activeTab === 'gallery' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Pet Library & Active Selector */}
              <PetGallery
                pets={pets}
                activePetId={config.activePetId}
                onSelectPet={handleSelectPet}
                onDeletePet={handleDeletePet}
              />

              {/* Drag & Drop Shimeji Uploader */}
              <PetUploader onPetImported={handlePetImported} />
            </div>
          )}

          {/* TAB 3: CÀI ĐẶT & VẬT LÝ (SETTINGS) */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Behavior & Physics Configuration */}
              <BehaviorSettingsCard config={config} onUpdateConfig={handleUpdateConfig} />

              {/* Quick macOS Interaction Guide */}
              <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082620]/85 via-[#061c18]/90 to-[#031411]/95 border border-[#00c49a]/30 p-4.5 sm:p-5 shadow-2xl backdrop-blur-xl flex items-start gap-3.5 text-[#5eead4]/85">
                <Info className="w-4 h-4 text-[#00c49a] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold text-[#f0fdf9]">Mẹo tương tác trên macOS:</span>{' '}
                  Nhấp giữ chuột trái trực tiếp vào bé Pet ngoài Desktop để nhấc bổng và thả ở vị
                  trí bất kỳ. Nhấp chuột phải vào nhân vật để mở nhanh menu điều khiển kích thước,
                  tốc độ và tạm dừng bước đi.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </MiniAppShell>
  );
}

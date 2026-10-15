import { useState, useMemo, useEffect } from 'react';
import {
  LaunchpadLayout,
  LaunchpadHeader,
  AppGrid,
  LaunchpadFooter,
  DropdownMenu,
  ContextMenu,
  AppInfoModal,
  AppStoreModal,
  Modal,
  DropdownMenuItem,
  ContextMenuItem,
} from '@nexus/ui';
import {
  NEXUS_APPS,
  NEXUS_CORE_APP,
  DEFAULT_INSTALLED_APP_IDS,
  AppId,
  AppCategory,
  APP_CATEGORY,
  NexusAppMeta,
} from '@nexus/shared';
import { Info, RefreshCw, Trash2, ArrowDownCircle, Play, Square, CheckCircle2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

const LOCAL_STORAGE_KEY = 'nexus_installed_app_ids';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<AppCategory>(APP_CATEGORY.ALL);
  const [selectedApp, setSelectedApp] = useState<NexusAppMeta | null>(null);

  // 1. Quản lý danh sách app hiển thị trên màn hình chính bằng Enum AppId
  const [installedAppIds, setInstalledAppIds] = useState<AppId[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as AppId[];
        }
      }
    } catch {
      // Fallback khi lỗi parse JSON
    }
    return [...DEFAULT_INSTALLED_APP_IDS];
  });

  const updateInstalledAppIds = (updater: (prev: AppId[]) => AppId[]) => {
    setInstalledAppIds((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Safe storage write fallback
      }
      return next;
    });
  };

  // 2. Trạng thái ứng dụng đang chạy (running) và đang cập nhật (updating)
  const [runningAppIds, setRunningAppIds] = useState<Set<AppId>>(new Set());
  const [updatingAppIds, setUpdatingAppIds] = useState<Set<AppId>>(new Set());

  // 3. Trạng thái cập nhật riêng của Nexus (cho menu Settings)
  const [nexusUpdateStatus, setNexusUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'latest' | 'updating' | 'restarting'
  >('idle');
  const [latestReleaseInfo, setLatestReleaseInfo] = useState<{
    version: string;
    downloadUrl?: string;
  } | null>(null);

  const isDev = import.meta.env.DEV;

  // 4. Quản lý UI Modals và Menus
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAppStoreOpen, setIsAppStoreOpen] = useState(false);
  const [infoModalApp, setInfoModalApp] = useState<NexusAppMeta | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    app: NexusAppMeta | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    app: null,
  });

  const enrichedApps = useMemo(() => {
    return NEXUS_APPS.filter((app) => installedAppIds.includes(app.id)).map((app) => {
      const isRunning = runningAppIds.has(app.id);
      const isUpdating = updatingAppIds.has(app.id);

      return {
        ...app,
        isRunning,
        isUpdating,
      };
    });
  }, [installedAppIds, runningAppIds, updatingAppIds]);

  const filteredApps = useMemo(() => {
    return enrichedApps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        currentCategory === APP_CATEGORY.ALL || app.category === currentCategory;

      return matchesSearch && matchesCategory;
    });
  }, [enrichedApps, searchQuery, currentCategory]);

  const handleSelectApp = (app: NexusAppMeta) => {
    setSelectedApp(app);
  };

  const handleLaunchApp = async (app: NexusAppMeta) => {
    setSelectedApp(app);
    setRunningAppIds((prev) => {
      const next = new Set(prev);
      next.add(app.id);
      return next;
    });

    // Mở ứng dụng macOS qua bundleId và tên ứng dụng bằng native Tauri command
    try {
      await invoke('open_mini_app', {
        bundleId: app.bundleId,
        appName: app.name,
      });
    } catch (err) {
      console.warn(`Không thể mở ứng dụng ${app.name} qua Tauri:`, err);
    }
  };

  const handleCloseApp = async (app: NexusAppMeta) => {
    setRunningAppIds((prev) => {
      const next = new Set(prev);
      next.delete(app.id);
      return next;
    });

    try {
      await invoke('close_mini_app', {
        bundleId: app.bundleId,
        appName: app.name,
      });
    } catch (err) {
      console.warn(`Không thể đóng ứng dụng ${app.name} qua Tauri:`, err);
    }
  };

  const handleToggleRunningApp = (app: NexusAppMeta) => {
    const isRunning = runningAppIds.has(app.id);
    if (isRunning) {
      handleCloseApp(app);
    } else {
      handleLaunchApp(app);
    }
  };

  // Đồng bộ 2 chiều trạng thái thực tế của các mini apps trên macOS
  useEffect(() => {
    let isMounted = true;

    const syncRunningApps = async () => {
      try {
        const appsToCheck = NEXUS_APPS.map((app) => ({
          id: app.id,
          bundleId: app.bundleId,
          name: app.name,
        }));

        const runningIds = await invoke<string[]>('check_running_apps', {
          apps: appsToCheck,
        });

        if (isMounted && Array.isArray(runningIds)) {
          setRunningAppIds((prev) => {
            const nextSet = new Set(runningIds as AppId[]);
            if (prev.size === nextSet.size && [...prev].every((id) => nextSet.has(id))) {
              return prev;
            }
            return nextSet;
          });
        }
      } catch {
        // Fallback khi chạy trên browser ngoài môi trường Tauri
      }
    };

    // Kiểm tra ngay khi mount
    syncRunningApps();

    // Định kỳ kiểm tra mỗi 1.5 giây
    const intervalId = setInterval(syncRunningApps, 1500);

    // Kiểm tra ngay khi Nexus nhận focus (khi user chuyển cửa sổ từ miniapp về Nexus)
    const handleFocus = () => {
      syncRunningApps();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, app: NexusAppMeta) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      app,
    });
  };

  const handleDeleteApp = (appId: AppId) => {
    updateInstalledAppIds((prev) => prev.filter((id) => id !== appId));
    setRunningAppIds((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      return next;
    });
  };

  const handleInstallAppFromStore = async (app: NexusAppMeta) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateInstalledAppIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));
  };

  // So sánh phiên bản SemVer (remote > current)
  const isNewerVersion = (remote: string, current: string): boolean => {
    const parse = (v: string) =>
      v
        .replace(/^v/, '')
        .split('.')
        .map((n) => parseInt(n, 10) || 0);
    const [r1 = 0, r2 = 0, r3 = 0] = parse(remote);
    const [c1 = 0, c2 = 0, c3 = 0] = parse(current);
    if (r1 !== c1) return r1 > c1;
    if (r2 !== c2) return r2 > c2;
    return r3 > c3;
  };

  // Kiểm tra phiên bản mới từ GitHub Release / apps.json
  const handleCheckNexusUpdate = async () => {
    setNexusUpdateStatus('checking');
    try {
      const res = await fetch(
        'https://raw.githubusercontent.com/thanhba0505/nexus/main/apps.json',
        { cache: 'no-store' },
      );
      if (res.ok) {
        const data = await res.json();
        const remoteVersion = data?.nexus?.version || data?.version;
        if (remoteVersion && isNewerVersion(remoteVersion, NEXUS_CORE_APP.version || '0.2.1')) {
          setLatestReleaseInfo({
            version: remoteVersion,
            downloadUrl: data?.nexus?.downloadUrl,
          });
          setNexusUpdateStatus('available');
          return;
        }
      }
      setNexusUpdateStatus('latest');
      setTimeout(() => setNexusUpdateStatus('idle'), 3000);
    } catch {
      setNexusUpdateStatus('latest');
      setTimeout(() => setNexusUpdateStatus('idle'), 3000);
    }
  };

  // Cập nhật toàn bộ hệ sinh thái Nexus và tất cả mini apps
  const handleApplyNexusUpdate = () => {
    setNexusUpdateStatus('updating');
    setUpdatingAppIds(new Set(installedAppIds));

    setTimeout(() => {
      setNexusUpdateStatus('restarting');
      setUpdatingAppIds(new Set());
      if (latestReleaseInfo?.downloadUrl) {
        window.open(latestReleaseInfo.downloadUrl, '_blank');
      }
      setTimeout(() => {
        setNexusUpdateStatus('idle');
      }, 1500);
    }, 1800);
  };

  const settingsMenuItems: DropdownMenuItem[] = useMemo(() => {
    const items: DropdownMenuItem[] = [];

    // 1. Trạng thái kiểm tra & cập nhật phiên bản
    if (nexusUpdateStatus === 'available') {
      items.push({
        id: 'update-nexus',
        label: `Cập nhật hệ sinh thái (v${latestReleaseInfo?.version || NEXUS_CORE_APP.version})`,
        icon: <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-400" />,
        variant: 'primary',
        badge: 'Bản mới',
        onClick: handleApplyNexusUpdate,
      });
    } else if (nexusUpdateStatus === 'latest') {
      items.push({
        id: 'nexus-latest',
        label: `Đã là phiên bản mới nhất (v${NEXUS_CORE_APP.version})`,
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        disabled: true,
        onClick: () => {},
      });
    } else {
      items.push({
        id: 'check-nexus-update',
        label: nexusUpdateStatus === 'checking' ? 'Đang kiểm tra...' : 'Kiểm tra phiên bản',
        icon: <RefreshCw className="w-3.5 h-3.5 text-white/70" />,
        isLoading: nexusUpdateStatus === 'checking',
        onClick: handleCheckNexusUpdate,
      });
    }

    // 2. Thông tin ứng dụng
    items.push({
      id: 'nexus-info',
      label: 'Thông tin ứng dụng',
      icon: <Info className="w-3.5 h-3.5 text-white/70" />,
      onClick: () => setInfoModalApp(NEXUS_CORE_APP),
    });

    return items;
  }, [isDev, nexusUpdateStatus, latestReleaseInfo]);

  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    const app = contextMenu.app;
    if (!app) return [];

    const isRunning = runningAppIds.has(app.id);

    return [
      {
        id: 'app-info',
        label: 'Thông tin ứng dụng',
        icon: <Info className="w-3.5 h-3.5 text-white/70" />,
        onClick: () => setInfoModalApp(app),
      },
      {
        id: 'toggle-running',
        label: isRunning ? 'Đóng' : 'Mở',
        icon: isRunning ? (
          <Square className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Play className="w-3.5 h-3.5 text-emerald-400" />
        ),
        onClick: () => handleToggleRunningApp(app),
      },
      {
        id: 'delete-app',
        label: 'Xóa khỏi màn hình',
        icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
        variant: 'danger',
        onClick: () => handleDeleteApp(app.id),
      },
    ];
  }, [contextMenu.app, runningAppIds]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('button, input, [role="button"], textarea, [data-no-drag]')) {
        try {
          getCurrentWindow().startDragging();
        } catch {
          // Bỏ qua nếu chạy ngoài môi trường Tauri
        }
      }
    }
  };

  return (
    <LaunchpadLayout>
      <LaunchpadHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen((prev) => !prev)}
        hasNexusUpdate={!isDev && nexusUpdateStatus === 'available'}
        onMouseDown={handleHeaderMouseDown}
        settingsMenu={
          <DropdownMenu
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            items={settingsMenuItems}
          />
        }
      />

      <main
        onClick={() => setSelectedApp(null)}
        className="w-full flex-1 flex flex-col items-center justify-center overflow-hidden"
      >
        {filteredApps.length > 0 || installedAppIds.length < NEXUS_APPS.length ? (
          <AppGrid
            apps={filteredApps}
            selectedAppId={selectedApp?.id}
            onSelectApp={handleSelectApp}
            onLaunchApp={handleLaunchApp}
            onContextMenu={handleContextMenu}
            onOpenAppStore={() => setIsAppStoreOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-white/50">
            <p className="text-lg font-medium">Không tìm thấy ứng dụng</p>
            <p className="text-sm text-white/40 mt-1">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </main>

      <LaunchpadFooter
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        onPowerOff={() => console.log('Thoát Launchpad')}
      />

      {contextMenu.isOpen && (
        <ContextMenu
          key={`${contextMenu.x}-${contextMenu.y}`}
          isOpen={contextMenu.isOpen}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
          items={contextMenuItems}
        />
      )}

      <AppInfoModal
        isOpen={infoModalApp !== null}
        onClose={() => setInfoModalApp(null)}
        app={infoModalApp}
      />

      <AppStoreModal
        isOpen={isAppStoreOpen}
        onClose={() => setIsAppStoreOpen(false)}
        availableApps={NEXUS_APPS}
        installedAppIds={installedAppIds}
        onInstallApp={handleInstallAppFromStore}
      />

      <Modal
        isOpen={!isDev && (nexusUpdateStatus === 'updating' || nexusUpdateStatus === 'restarting')}
        onClose={() => {}}
        title="Cập nhật hệ sinh thái Nexus"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            {nexusUpdateStatus === 'updating' ? (
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {nexusUpdateStatus === 'updating'
                ? 'Đang tải bản cập nhật hệ sinh thái...'
                : 'Đang khởi động lại Nexus...'}
            </h4>
            <p className="text-xs text-white/60 mt-1">
              {nexusUpdateStatus === 'updating'
                ? 'Đang áp dụng gói nâng cấp toàn bộ hệ sinh thái v0.2.0'
                : 'Hệ sinh thái Nexus đã sẵn sàng với phiên bản mới!'}
            </p>
          </div>
        </div>
      </Modal>
    </LaunchpadLayout>
  );
}

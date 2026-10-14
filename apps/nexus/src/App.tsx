import { useState, useMemo } from 'react';
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

  // 3. Trạng thái cập nhật của từng mini app
  const [appUpdates, setAppUpdates] = useState<
    Partial<Record<AppId, { hasUpdate: boolean; newVersion: string }>>
  >(() => ({
    [AppId.SLACKBOT]: { hasUpdate: true, newVersion: '0.3.0' },
  }));

  // 4. Trạng thái cập nhật riêng của Nexus (cho menu Settings)
  const [nexusUpdateStatus, setNexusUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'updating' | 'restarting'
  >('idle');

  // 5. Quản lý UI Modals và Menus
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
      const updateInfo = appUpdates[app.id];
      const hasUpdate = updateInfo ? updateInfo.hasUpdate : false;
      const newVersion = updateInfo ? updateInfo.newVersion : undefined;
      const isRunning = runningAppIds.has(app.id);
      const isUpdating = updatingAppIds.has(app.id);

      return {
        ...app,
        hasUpdate,
        newVersion,
        isRunning,
        isUpdating,
      };
    });
  }, [installedAppIds, appUpdates, runningAppIds, updatingAppIds]);

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

  const handleLaunchApp = (app: NexusAppMeta) => {
    setSelectedApp(app);
    setRunningAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(app.id)) {
        next.delete(app.id);
      } else {
        next.add(app.id);
      }
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, app: NexusAppMeta) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      app,
    });
  };

  const handleUpdateApp = (appId: AppId) => {
    if (runningAppIds.has(appId)) return;

    setUpdatingAppIds((prev) => new Set(prev).add(appId));

    setTimeout(() => {
      setUpdatingAppIds((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
      setAppUpdates((prev) => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
    }, 1600);
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

  const handleCheckNexusUpdate = () => {
    setNexusUpdateStatus('checking');
    setTimeout(() => {
      setNexusUpdateStatus('available');
    }, 1000);
  };

  // Cập nhật toàn bộ hệ sinh thái Nexus và tất cả mini apps
  const handleApplyNexusUpdate = () => {
    setNexusUpdateStatus('updating');
    setUpdatingAppIds(new Set(installedAppIds));

    setTimeout(() => {
      setNexusUpdateStatus('restarting');
      setUpdatingAppIds(new Set());
      setAppUpdates({});
      setTimeout(() => {
        setNexusUpdateStatus('idle');
      }, 1500);
    }, 1800);
  };

  const settingsMenuItems: DropdownMenuItem[] = useMemo(() => {
    if (nexusUpdateStatus === 'available') {
      return [
        {
          id: 'update-nexus',
          label: 'Cập nhật toàn bộ hệ sinh thái (v0.3.0)',
          icon: <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-400" />,
          variant: 'primary',
          badge: 'Bản mới',
          onClick: handleApplyNexusUpdate,
        },
        {
          id: 'nexus-info',
          label: 'Thông tin ứng dụng',
          icon: <Info className="w-3.5 h-3.5 text-white/70" />,
          onClick: () => setInfoModalApp(NEXUS_CORE_APP),
        },
      ];
    }

    return [
      {
        id: 'check-nexus-update',
        label: nexusUpdateStatus === 'checking' ? 'Đang kiểm tra...' : 'Kiểm tra phiên bản',
        icon: <RefreshCw className="w-3.5 h-3.5 text-white/70" />,
        isLoading: nexusUpdateStatus === 'checking',
        onClick: handleCheckNexusUpdate,
      },
      {
        id: 'nexus-info',
        label: 'Thông tin ứng dụng',
        icon: <Info className="w-3.5 h-3.5 text-white/70" />,
        onClick: () => setInfoModalApp(NEXUS_CORE_APP),
      },
    ];
  }, [nexusUpdateStatus]);

  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    const app = contextMenu.app;
    if (!app) return [];

    const isRunning = runningAppIds.has(app.id);
    const updateInfo = appUpdates[app.id];
    const hasUpdate = Boolean(updateInfo?.hasUpdate);
    const isUpdating = updatingAppIds.has(app.id);

    const items: ContextMenuItem[] = [
      {
        id: 'app-info',
        label: 'Thông tin ứng dụng',
        icon: <Info className="w-3.5 h-3.5 text-white/70" />,
        onClick: () => setInfoModalApp(app),
      },
      {
        id: 'toggle-running',
        label: isRunning ? 'Đóng ứng dụng (Đang mở)' : 'Chạy thử (Mở app)',
        icon: isRunning ? (
          <Square className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Play className="w-3.5 h-3.5 text-emerald-400" />
        ),
        onClick: () => handleLaunchApp(app),
      },
    ];

    if (hasUpdate) {
      items.push({
        id: 'update-app',
        label: isUpdating
          ? 'Đang cập nhật...'
          : `Cập nhật lên v${updateInfo?.newVersion || '0.2.0'}`,
        icon: <ArrowDownCircle className="w-3.5 h-3.5" />,
        variant: 'primary',
        isLoading: isUpdating,
        disabled: isRunning,
        tooltip: isRunning ? 'Vui lòng đóng ứng dụng trước khi cập nhật' : undefined,
        onClick: () => handleUpdateApp(app.id),
      });
    }

    items.push({
      id: 'delete-app',
      label: 'Xóa khỏi màn hình',
      icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
      variant: 'danger',
      onClick: () => handleDeleteApp(app.id),
    });

    return items;
  }, [contextMenu.app, runningAppIds, appUpdates, updatingAppIds]);

  return (
    <LaunchpadLayout>
      <LaunchpadHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen((prev) => !prev)}
        hasNexusUpdate={nexusUpdateStatus === 'available'}
        settingsMenu={
          <DropdownMenu
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            items={settingsMenuItems}
          />
        }
      />

      <main className="w-full flex-1 flex flex-col items-center justify-center overflow-hidden">
        {filteredApps.length > 0 || installedAppIds.length < NEXUS_APPS.length ? (
          <AppGrid
            apps={filteredApps}
            selectedAppId={selectedApp?.id}
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

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        items={contextMenuItems}
      />

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
        isOpen={nexusUpdateStatus === 'updating' || nexusUpdateStatus === 'restarting'}
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
                ? 'Đang áp dụng gói nâng cấp toàn bộ hệ sinh thái v0.3.0'
                : 'Hệ sinh thái Nexus đã sẵn sàng với phiên bản mới!'}
            </p>
          </div>
        </div>
      </Modal>
    </LaunchpadLayout>
  );
}

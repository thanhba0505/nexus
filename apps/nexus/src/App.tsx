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
import { NEXUS_APPS, NEXUS_CORE_APP, AppCategory, APP_CATEGORY, NexusAppMeta } from '@nexus/shared';
import { Info, RefreshCw, Trash2, ArrowDownCircle, Play, Square, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nexus_installed_app_ids';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<AppCategory>(APP_CATEGORY.ALL);
  const [selectedApp, setSelectedApp] = useState<NexusAppMeta | null>(null);

  // 1. Quản lý danh sách app hiển thị trên màn hình chính
  const [installedAppIds, setInstalledAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback default
    }
    return ['slackbot', 'github-report'];
  });

  // Lưu installedAppIds mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(installedAppIds));
  }, [installedAppIds]);

  // 2. Trạng thái ứng dụng đang chạy (running) và đang cập nhật (updating)
  const [runningAppIds, setRunningAppIds] = useState<Set<string>>(new Set());
  const [updatingAppIds, setUpdatingAppIds] = useState<Set<string>>(new Set());

  // 3. Trạng thái cập nhật của từng mini app (tự động load 1 lần khi mở app)
  const [appUpdates, setAppUpdates] = useState<
    Record<string, { hasUpdate: boolean; newVersion: string }>
  >({});

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

  // Tự động quét cập nhật 1 lần khi Nexus khởi chạy
  useEffect(() => {
    const checkTimer = setTimeout(() => {
      // Giả lập phát hiện bản cập nhật mới cho SlackBot để kiểm thử tính năng
      setAppUpdates({
        slackbot: { hasUpdate: true, newVersion: '0.2.0' },
      });
    }, 600);
    return () => clearTimeout(checkTimer);
  }, []);

  // Tổng hợp dữ liệu hiển thị cho các app đã cài đặt
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

  // Lọc app theo tìm kiếm và danh mục
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

  // Xử lý mở/tắt app khi bấm vào icon
  const handleLaunchApp = (app: NexusAppMeta) => {
    setSelectedApp(app);
    // Bật/tắt trạng thái chạy để dễ dàng kiểm thử tính năng chặn cập nhật
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

  // Mở menu chuột phải
  const handleContextMenu = (e: React.MouseEvent, app: NexusAppMeta) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      app,
    });
  };

  // Cập nhật mini app
  const handleUpdateApp = (appId: string) => {
    if (runningAppIds.has(appId)) return; // Bị chặn nếu app đang chạy

    setUpdatingAppIds((prev) => new Set(prev).add(appId));

    // Mô phỏng tiến trình tải và cập nhật
    setTimeout(() => {
      setUpdatingAppIds((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
      // Xóa badge cập nhật sau khi hoàn tất
      setAppUpdates((prev) => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
    }, 1600);
  };

  // Xóa app khỏi màn hình chính (đưa vào kho dấu cộng)
  const handleDeleteApp = (appId: string) => {
    setInstalledAppIds((prev) => prev.filter((id) => id !== appId));
    setRunningAppIds((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      return next;
    });
  };

  // Thêm app từ modal kho ứng dụng (+)
  const handleInstallAppFromStore = async (app: NexusAppMeta) => {
    // Mô phỏng thời gian tải
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInstalledAppIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));
  };

  // Xử lý kiểm tra cập nhật cho Nexus Launcher trong Settings
  const handleCheckNexusUpdate = () => {
    setNexusUpdateStatus('checking');
    setTimeout(() => {
      setNexusUpdateStatus('available');
    }, 1000);
  };

  // Xử lý cập nhật Nexus
  const handleApplyNexusUpdate = () => {
    setNexusUpdateStatus('updating');
    setTimeout(() => {
      setNexusUpdateStatus('restarting');
      setTimeout(() => {
        setNexusUpdateStatus('idle');
      }, 1500);
    }, 1800);
  };

  // Cấu hình danh sách mục cho Settings Dropdown
  const settingsMenuItems: DropdownMenuItem[] = useMemo(() => {
    if (nexusUpdateStatus === 'available') {
      return [
        {
          id: 'update-nexus',
          label: 'Cập nhật Nexus lên v0.2.0',
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

  // Cấu hình menu chuột phải cho từng mini app
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

    // Chỉ hiển thị mục Cập nhật nếu app có bản mới
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

    // Nút xóa khỏi màn hình chính
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
      {/* Header với thanh tìm kiếm và icon Cài đặt (kèm Dropdown) */}
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

      {/* Lưới hiển thị các Mini App độc lập và Nút dấu cộng (+) */}
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

      {/* Footer danh mục */}
      <LaunchpadFooter
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        onPowerOff={() => console.log('Thoát Launchpad')}
      />

      {/* Menu chuột phải tại vị trí con trỏ */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        items={contextMenuItems}
      />

      {/* In-app Modal: Thông tin ứng dụng (Nexus hoặc Mini App) */}
      <AppInfoModal
        isOpen={infoModalApp !== null}
        onClose={() => setInfoModalApp(null)}
        app={infoModalApp}
      />

      {/* In-app Modal: Kho ứng dụng dấu cộng (+) để tìm kiếm và thêm lại app */}
      <AppStoreModal
        isOpen={isAppStoreOpen}
        onClose={() => setIsAppStoreOpen(false)}
        availableApps={NEXUS_APPS}
        installedAppIds={installedAppIds}
        onInstallApp={handleInstallAppFromStore}
      />

      {/* Modal thông báo tiến trình khởi động lại khi cập nhật Nexus */}
      <Modal
        isOpen={nexusUpdateStatus === 'updating' || nexusUpdateStatus === 'restarting'}
        onClose={() => {}}
        title="Cập nhật Nexus"
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
                ? 'Đang tải bản cập nhật...'
                : 'Đang khởi động lại Nexus...'}
            </h4>
            <p className="text-xs text-white/60 mt-1">
              {nexusUpdateStatus === 'updating'
                ? 'Đang áp dụng gói nâng cấp hệ sinh thái v0.2.0'
                : 'Ứng dụng đã sẵn sàng với phiên bản mới!'}
            </p>
          </div>
        </div>
      </Modal>
    </LaunchpadLayout>
  );
}

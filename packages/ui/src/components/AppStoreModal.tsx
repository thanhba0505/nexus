import React, { useState } from 'react';
import { Search, Check, Plus, Box } from 'lucide-react';
import { NexusAppMeta, AppId } from '@nexus/shared';
import { Modal } from './Modal';
import { clsx } from 'clsx';

export interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableApps: readonly NexusAppMeta[];
  installedAppIds: readonly (string | AppId)[];
  onInstallApp: (app: NexusAppMeta) => Promise<void> | void;
}

export function AppStoreModal({
  isOpen,
  onClose,
  availableApps,
  installedAppIds,
  onInstallApp,
}: AppStoreModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);

  const filteredApps = availableApps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleInstall = async (app: NexusAppMeta) => {
    setLoadingAppId(app.id);
    try {
      await onInstallApp(app);
    } finally {
      setLoadingAppId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kho ứng dụng Nexus"
      subtitle="Tìm kiếm và thêm mini app vào màn hình chính"
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col space-y-4">
        {/* Search bar inside Modal */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm mini app theo tên hoặc tính năng..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-md transition-all"
          />
        </div>

        {/* App List */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => {
              const isInstalled = installedAppIds.includes(app.id);
              const isLoading = loadingAppId === app.id;

              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${app.accentColor}dd, ${app.accentColor}99)`,
                      }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm border border-white/15"
                    >
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-white">{app.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                          v{app.version || '0.1.0'}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 line-clamp-1">{app.description}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isInstalled ? (
                      <span className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã có</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstall(app)}
                        disabled={isLoading}
                        className={clsx(
                          'flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-md',
                          isLoading
                            ? 'bg-indigo-600/50 text-white cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95',
                        )}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang thêm...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm vào màn hình</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-white/40 text-xs">
              Không tìm thấy mini app phù hợp trong hệ sinh thái.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

import { useState, useMemo } from 'react';
import { LaunchpadLayout, LaunchpadHeader, AppGrid, LaunchpadFooter } from '@nexus/ui';
import { NEXUS_APPS, AppCategory, APP_CATEGORY, NexusAppMeta } from '@nexus/shared';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<AppCategory>(APP_CATEGORY.ALL);
  const [selectedApp, setSelectedApp] = useState<NexusAppMeta | null>(null);

  const filteredApps = useMemo(() => {
    return NEXUS_APPS.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        currentCategory === APP_CATEGORY.ALL || app.category === currentCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, currentCategory]);

  const handleLaunchApp = (app: NexusAppMeta) => {
    setSelectedApp(app);
    console.log(`Launching mini app: ${app.name} (${app.bundleId})`);
  };

  const handlePowerOff = () => {
    console.log('Exit Launchpad');
  };

  return (
    <LaunchpadLayout>
      <LaunchpadHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="w-full flex-1 flex flex-col items-center justify-center overflow-hidden">
        {filteredApps.length > 0 ? (
          <AppGrid
            apps={filteredApps}
            selectedAppId={selectedApp?.id}
            onLaunchApp={handleLaunchApp}
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
        onPowerOff={handlePowerOff}
      />
    </LaunchpadLayout>
  );
}

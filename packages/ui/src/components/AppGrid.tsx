import React from 'react';
import { NexusAppMeta } from '@nexus/shared';
import { AppIconItem } from './AppIconItem';

export interface AppGridProps {
  apps: readonly NexusAppMeta[];
  selectedAppId?: string | undefined;
  onSelectApp?: ((app: NexusAppMeta) => void) | undefined;
  onLaunchApp: (app: NexusAppMeta) => void;
  onContextMenu?: ((e: React.MouseEvent, app: NexusAppMeta) => void) | undefined;
  onOpenAppStore?: (() => void) | undefined;
}

export function AppGrid({
  apps,
  selectedAppId,
  onSelectApp,
  onLaunchApp,
  onContextMenu,
  onOpenAppStore,
}: AppGridProps) {
  return (
    <div className="w-full flex-1 overflow-y-auto px-6 py-4 flex items-center justify-center">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-y-6 gap-x-6 max-w-4xl justify-items-center items-center">
        {apps.map((app) => (
          <AppIconItem
            key={app.id}
            app={app}
            isSelected={selectedAppId === app.id}
            onSelect={onSelectApp}
            onLaunch={onLaunchApp}
            onContextMenu={onContextMenu}
          />
        ))}

        {/* Plus Button to Open App Library */}
        {onOpenAppStore && <AppIconItem isAddButton onAddClick={onOpenAppStore} />}
      </div>
    </div>
  );
}

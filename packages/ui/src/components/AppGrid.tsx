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
    <div className="w-full flex-1 overflow-y-auto px-8 py-8 flex items-center justify-center">
      <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-10 sm:gap-y-12 max-w-5xl mx-auto">
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

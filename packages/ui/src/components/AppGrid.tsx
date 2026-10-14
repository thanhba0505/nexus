import React from 'react';
import { NexusAppMeta } from '@nexus/shared';
import { AppIconItem } from './AppIconItem';

export interface AppGridProps {
  apps: readonly NexusAppMeta[];
  selectedAppId?: string | undefined;
  onLaunchApp: (app: NexusAppMeta) => void;
}

export function AppGrid({ apps, selectedAppId, onLaunchApp }: AppGridProps) {
  return (
    <div className="w-full flex-1 overflow-y-auto px-6 py-4 flex items-center justify-center">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-y-6 gap-x-4 max-w-5xl justify-items-center">
        {apps.map((app) => (
          <AppIconItem
            key={app.id}
            app={app}
            isSelected={selectedAppId === app.id}
            onLaunch={onLaunchApp}
          />
        ))}
      </div>
    </div>
  );
}

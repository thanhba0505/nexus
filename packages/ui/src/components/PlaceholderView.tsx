import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { APP_STATUS } from '@nexus/shared';
import { Box } from 'lucide-react';

export interface PlaceholderViewProps {
  appName: string;
  description: string;
  icon?: React.ReactNode;
}

export function PlaceholderView({ appName, description, icon }: PlaceholderViewProps) {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-2xl select-none">
      <Card className="max-w-md w-full flex flex-col items-center text-center p-8 border-white/15">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/20 flex items-center justify-center mb-6 shadow-xl">
          {icon || <Box className="w-10 h-10 text-indigo-300" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{appName}</h1>
        <p className="text-sm text-white/70 mb-6">{description}</p>
        <Badge status={APP_STATUS.COMING_SOON} className="text-xs px-3 py-1" />
      </Card>
    </div>
  );
}

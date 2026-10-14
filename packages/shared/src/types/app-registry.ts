export enum AppId {
  NEXUS = 'nexus',
  SLACKBOT = 'slackbot',
  GITHUB_REPORT = 'github-report',
}

export const APP_CATEGORY = {
  ALL: 'all',
  DEV: 'dev',
  CHAT: 'chat',
  GAMES: 'games',
  UTILITIES: 'utilities',
} as const;

export type AppCategory = (typeof APP_CATEGORY)[keyof typeof APP_CATEGORY];

export const APP_STATUS = {
  READY: 'ready',
  COMING_SOON: 'coming-soon',
  MAINTENANCE: 'maintenance',
} as const;

export type AppStatus = (typeof APP_STATUS)[keyof typeof APP_STATUS];

export interface NexusAppMeta {
  id: AppId;
  name: string;
  description: string;
  bundleId: string;
  port: number;
  status: AppStatus;
  category: AppCategory;
  iconName: string;
  accentColor: string;
  version?: string | undefined;
  hasUpdate?: boolean | undefined;
  newVersion?: string | undefined;
  isRunning?: boolean | undefined;
  isUpdating?: boolean | undefined;
  isInstalled?: boolean | undefined;
  isCustomPlaceholder?: boolean | undefined;
}

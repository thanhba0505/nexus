import { APP_CATEGORY, APP_STATUS, AppId, NexusAppMeta } from '../types/app-registry';

/**
 * Danh sách ID các mini app mặc định hiển thị trên màn hình chính Launchpad.
 * Sử dụng Enum AppId thay vì hardcoded string mảng.
 */
export const DEFAULT_INSTALLED_APP_IDS: readonly AppId[] = [AppId.SLACKBOT, AppId.GITHUB_REPORT];

/**
 * Nexus Launcher Core App Meta (Host App)
 */
export const NEXUS_CORE_APP: NexusAppMeta = {
  id: AppId.NEXUS,
  name: 'Nexus',
  description: 'Launchpad trung tâm & quản lý hệ sinh thái macOS',
  bundleId: 'com.thanhba.nexus',
  port: 1420,
  version: '0.2.1',
  status: APP_STATUS.READY,
  category: APP_CATEGORY.UTILITIES,
  iconName: 'LayoutGrid',
  accentColor: '#6366f1',
};

/**
 * Danh sách các Mini App thực tế trong hệ sinh thái Nexus.
 * Không chứa Nexus (vì Nexus là launcher host) và không chứa mock placeholders.
 */
export const NEXUS_APPS: readonly NexusAppMeta[] = [
  {
    id: AppId.SLACKBOT,
    name: 'SlackBot',
    description: 'Trợ lý thông báo Slack & webhook tự động',
    bundleId: 'com.thanhba.nexus.slackbot',
    port: 1421,
    version: '0.2.1',
    status: APP_STATUS.READY,
    category: APP_CATEGORY.CHAT,
    iconName: 'MessageSquare',
    accentColor: '#10b981',
  },
  {
    id: AppId.GITHUB_REPORT,
    name: 'GitHub Report',
    description: 'Theo dõi Pull Request & báo cáo commit GitHub',
    bundleId: 'com.thanhba.nexus.githubreport',
    port: 1422,
    version: '0.2.1',
    status: APP_STATUS.READY,
    category: APP_CATEGORY.DEV,
    iconName: 'GitPullRequest',
    accentColor: '#0ea5e9',
  },
] as const;

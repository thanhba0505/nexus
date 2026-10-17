import { useState } from 'react';
import { MessageSquare, Sparkles, Bot, Hash, Settings } from 'lucide-react';
import {
  AppSplashScreen,
  AppLayout,
  AppSidebar,
  useAppBootstrap,
  useHotkeys,
  AppSidebarTab,
} from '@nexus/ui';
import { UnifiedHeader } from './components/UnifiedHeader';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { ConversationsModal } from './components/ConversationsModal';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { useSlackSettings } from './hooks/use-slack-settings';
import { useSlackStatus } from './hooks/use-slack-status';
import { slackbotApi } from './services/slackbot-api';
import type { ConversationRule } from './types';

export type SlackbotTab = 'overview' | 'conversations' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<SlackbotTab>('overview');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);

  const appSettings = useSlackSettings();
  const { settings } = appSettings;
  const slackStatus = useSlackStatus();

  const boot = useAppBootstrap({
    steps: [
      {
        label: 'Nạp cấu hình settings.json…',
        run: async () => void (await appSettings.load()),
      },
      {
        label: 'Kiểm tra macOS Keychain & Local AI…',
        run: async () => void (await slackStatus.refreshStatus()),
      },
    ],
    onReady: () => {
      // Sẵn sàng nhận lệnh
    },
  });

  const isBusy = slackStatus.isLoading;

  const refresh = () => {
    if (isBusy) return;
    void slackStatus.refreshStatus();
  };

  const handleSaveCredentials = async (userToken: string, appToken: string) => {
    await slackbotApi.saveSlackCredentials(userToken, appToken);
    await slackStatus.refreshStatus();
  };

  const handleDeleteCredentials = async () => {
    await slackbotApi.deleteSlackCredentials();
    await slackStatus.refreshStatus();
  };

  const handleSaveConversations = async (conversations: ConversationRule[]) => {
    await appSettings.save({
      ...settings,
      conversations,
    });
  };

  const TABS: AppSidebarTab[] = [
    { id: 'overview', label: 'Tổng quan BOT', icon: Bot, shortcut: '⌘1' },
    {
      id: 'conversations',
      label: 'Kênh & Whitelist',
      icon: Hash,
      shortcut: '⌘2',
      badge: settings.conversations.filter((c) => c.enabled).length,
    },
    { id: 'settings', label: 'Cấu hình & Token', icon: Settings, shortcut: '⌘3' },
  ];

  useHotkeys(
    {
      'mod+r': () => {
        if (isBusy) return;
        refresh();
      },
      'mod+1': () => setActiveTab('overview'),
      'mod+2': () => setActiveTab('conversations'),
      'mod+3': () => setActiveTab('settings'),
      'mod+,': () => setActiveTab((tab) => (tab === 'settings' ? 'overview' : 'settings')),
      escape:
        (isSettingsOpen || isConversationsOpen) &&
        (() => {
          setIsSettingsOpen(false);
          setIsConversationsOpen(false);
        }),
    },
    {
      enabled: boot.isReady,
      enableInInputs: ['escape', 'mod+r', 'mod+,', 'mod+1', 'mod+2', 'mod+3'],
    },
  );

  return (
    <AppLayout
      theme="slackbot"
      splash={
        !boot.isReady && (
          <AppSplashScreen
            icon={
              <div className="relative">
                <MessageSquare className="h-10 w-10 text-violet-400" />
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/20">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-violet-300 [animation-duration:4s]" />
                </div>
              </div>
            }
            title="SlackBot"
            progress={boot.progress}
            message={boot.message}
            isExiting={boot.phase === 'exiting'}
          />
        )
      }
      header={
        <UnifiedHeader
          status={slackStatus.status}
          isBusy={isBusy}
          prefix={settings.identity.defaultPrefix}
          enablePrefix={settings.identity.enablePrefix}
          allowedChannelsCount={settings.conversations.filter((c) => c.enabled).length}
          onRefresh={refresh}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenConversations={() => setActiveTab('conversations')}
        />
      }
      sidebar={
        <AppSidebar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as SlackbotTab)}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
          title="Điều Hướng"
        />
      }
      footer={
        <StatusBar
          status={slackStatus.status}
          credentials={slackStatus.credentials}
          isBusy={isBusy}
        />
      }
      overlays={
        <>
          {isSettingsOpen && (
            <SettingsModal
              isOpen
              onClose={() => setIsSettingsOpen(false)}
              settings={settings}
              credentials={slackStatus.credentials}
              status={slackStatus.status}
              onSaveSettings={(next) => void appSettings.save(next)}
              onSaveCredentials={handleSaveCredentials}
              onDeleteCredentials={handleDeleteCredentials}
            />
          )}

          {isConversationsOpen && (
            <ConversationsModal
              isOpen
              onClose={() => setIsConversationsOpen(false)}
              conversations={settings.conversations}
              defaultPrefix={settings.identity.defaultPrefix}
              onSaveConversations={(rules) => void handleSaveConversations(rules)}
            />
          )}
        </>
      }
      mainClassName="p-4.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar"
    >
      {activeTab === 'settings' ? (
        <SettingsView
          settings={settings}
          credentials={slackStatus.credentials}
          status={slackStatus.status}
          onSaveSettings={(next) => void appSettings.save(next)}
          onSaveCredentials={handleSaveCredentials}
          onDeleteCredentials={handleDeleteCredentials}
        />
      ) : (
        <DashboardView
          settings={settings}
          status={slackStatus.status}
          credentials={slackStatus.credentials}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenConversations={() => setIsConversationsOpen(true)}
        />
      )}
    </AppLayout>
  );
}

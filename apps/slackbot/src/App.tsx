import { useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { AppSplashScreen, AppLayout, useAppBootstrap, useHotkeys } from '@nexus/ui';
import { UnifiedHeader } from './components/UnifiedHeader';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { ConversationsModal } from './components/ConversationsModal';
import { DashboardView } from './components/DashboardView';
import { useSlackSettings } from './hooks/use-slack-settings';
import { useSlackStatus } from './hooks/use-slack-status';
import { slackbotApi } from './services/slackbot-api';
import type { ConversationRule } from './types';

export default function App() {
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

  useHotkeys(
    {
      'mod+r': () => {
        if (isBusy) return;
        refresh();
      },
      'mod+,': () => setIsSettingsOpen((open) => !open),
      escape:
        (isSettingsOpen || isConversationsOpen) &&
        (() => {
          setIsSettingsOpen(false);
          setIsConversationsOpen(false);
        }),
    },
    { enabled: boot.isReady, enableInInputs: ['escape', 'mod+r', 'mod+,'] },
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
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenConversations={() => setIsConversationsOpen(true)}
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
      mainClassName="gap-2.5 overflow-hidden p-3"
    >
      <DashboardView
        settings={settings}
        status={slackStatus.status}
        credentials={slackStatus.credentials}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenConversations={() => setIsConversationsOpen(true)}
      />
    </AppLayout>
  );
}

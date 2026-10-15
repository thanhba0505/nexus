import { PlaceholderView } from '@nexus/ui';
import { MessageSquare } from 'lucide-react';
import { NEXUS_APPS, AppId } from '@nexus/shared';

export default function App() {
  const meta = NEXUS_APPS.find((app) => app.id === AppId.SLACKBOT);
  const version = meta?.version || '0.2.1';

  return (
    <PlaceholderView
      appName="SlackBot"
      description={meta?.description || 'Slack automation assistant'}
      currentVersion={version}
      newVersion={version}
      downloadUrl={`https://github.com/thanhba0505/nexus/releases/download/v${version}/SlackBot_${version}_aarch64.dmg`}
      icon={<MessageSquare className="w-10 h-10 text-emerald-400" />}
      isDev={import.meta.env.DEV}
    />
  );
}

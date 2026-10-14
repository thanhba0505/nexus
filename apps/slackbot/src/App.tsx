import { PlaceholderView } from '@nexus/ui';
import { MessageSquare } from 'lucide-react';

export default function App() {
  return (
    <PlaceholderView
      appName="SlackBot"
      description="Slack automation assistant"
      currentVersion="0.1.0"
      newVersion="0.3.0"
      downloadUrl="https://github.com/thanhba0505/nexus/releases/download/v0.3.0/SlackBot_0.3.0_aarch64.dmg"
      icon={<MessageSquare className="w-10 h-10 text-emerald-400" />}
    />
  );
}

import { PlaceholderView } from '@nexus/ui';
import { MessageSquare } from 'lucide-react';

export default function App() {
  return (
    <PlaceholderView
      appName="SlackBot"
      description="Coming soon"
      icon={<MessageSquare className="w-10 h-10 text-emerald-400" />}
    />
  );
}

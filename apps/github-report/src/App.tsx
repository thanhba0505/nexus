import { PlaceholderView } from '@nexus/ui';
import { GitPullRequest } from 'lucide-react';

export default function App() {
  return (
    <PlaceholderView
      appName="GitHub Report"
      description="Coming soon"
      icon={<GitPullRequest className="w-10 h-10 text-sky-400" />}
    />
  );
}

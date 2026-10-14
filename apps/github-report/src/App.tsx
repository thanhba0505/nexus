import { PlaceholderView } from '@nexus/ui';
import { GitPullRequest } from 'lucide-react';

export default function App() {
  return (
    <PlaceholderView
      appName="GitHub Report"
      description="GitHub PR and commit monitor"
      currentVersion="0.1.0"
      newVersion="0.3.0"
      downloadUrl="https://github.com/thanhba0505/nexus/releases/download/v0.3.0/GitHub_Report_0.3.0_aarch64.dmg"
      icon={<GitPullRequest className="w-10 h-10 text-sky-400" />}
    />
  );
}

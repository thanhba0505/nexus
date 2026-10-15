import { PlaceholderView } from '@nexus/ui';
import { GitPullRequest } from 'lucide-react';
import { NEXUS_APPS, AppId } from '@nexus/shared';

export default function App() {
  const meta = NEXUS_APPS.find((app) => app.id === AppId.GITHUB_REPORT);
  const version = meta?.version || '0.2.1';

  return (
    <PlaceholderView
      appName="GitHub Report"
      description={meta?.description || 'GitHub PR and commit monitor'}
      currentVersion={version}
      newVersion={version}
      downloadUrl={`https://github.com/thanhba0505/nexus/releases/download/v${version}/GitHub_Report_${version}_aarch64.dmg`}
      icon={<GitPullRequest className="w-10 h-10 text-sky-400" />}
      isDev={import.meta.env.DEV}
    />
  );
}

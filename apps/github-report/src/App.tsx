import { useState } from 'react';
import { GitPullRequest, Sparkles, Settings } from 'lucide-react';
import {
  AppSplashScreen,
  AppLayout,
  AppSidebar,
  useAppBootstrap,
  useHotkeys,
  useLatestRef,
} from '@nexus/ui';
import { UnifiedHeader } from './components/UnifiedHeader';
import { AISummaryCard } from './components/AISummaryCard';
import { PRTimelineCard } from './components/PRTimelineCard';
import { StatusBar } from './components/StatusBar';
import { SettingsView } from './components/SettingsView';
import { SettingsModal } from './components/SettingsModal';
import { useAppSettings } from './hooks/use-app-settings';
import { useGithubReport } from './hooks/use-github-report';
import { githubReportApi } from './services/github-report-api';
import { getDestinationLabel } from './lib/report-utils';
import type { DateMode, PrereqStatus } from './types';

export type GithubReportTab = 'standup' | 'timeline' | 'settings';

interface TabDefinition {
  id: GithubReportTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const TABS: TabDefinition[] = [
  { id: 'standup', label: 'Daily Standup', icon: Sparkles, shortcut: '⌘1' },
  { id: 'timeline', label: 'Lịch sử PRs', icon: GitPullRequest, shortcut: '⌘2' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, shortcut: '⌘3' },
];

/**
 * Luồng UI (xem docs/mini-app-guide.md):
 * 1. Splash: nạp settings + kiểm tra môi trường (useAppBootstrap, chạy đúng 1 lần).
 * 2. onReady → loadReport(): quét PR (skeleton) → tóm tắt AI (skeleton/thanh mảnh).
 * 3. Mọi lần chạy lại đều do người dùng kích hoạt (⌘R, đổi ngày, Tóm tắt lại) — không có
 *    useEffect nào tự gọi API, nên không thể xảy ra vòng lặp.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<GithubReportTab>('standup');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [prereqStatus, setPrereqStatus] = useState<PrereqStatus | null>(null);

  const appSettings = useAppSettings();
  const { settings } = appSettings;
  const report = useGithubReport({ settingsRef: appSettings.settingsRef });
  const dateModeRef = useLatestRef(dateMode);

  const boot = useAppBootstrap({
    steps: [
      { label: 'Nạp cấu hình settings.json…', run: async () => void (await appSettings.load()) },
      {
        label: 'Kiểm tra GitHub CLI & Local AI…',
        run: async () => setPrereqStatus(await githubReportApi.checkPrerequisites()),
      },
    ],
    onReady: () => void report.loadReport(dateModeRef.current),
  });

  const { prsTask, summaryTask } = report;
  const isBusy = prsTask.isRunning || summaryTask.isRunning;
  const hasPrs = (report.prs?.length ?? 0) > 0;
  const canCopy = (summaryTask.data?.bullets.length ?? 0) > 0;
  const canReveal = settings.workflow.destination !== 'copy_only';

  const refresh = () => {
    if (isBusy) return;
    void report.loadReport(dateMode);
  };

  const changeDateMode = (mode: DateMode) => {
    if (isBusy || mode === dateMode) return;
    setDateMode(mode);
    void report.loadReport(mode);
  };

  const saveToken = async (token: string) => {
    await githubReportApi.saveGithubToken(token);
    setPrereqStatus(await githubReportApi.checkPrerequisites());
  };

  useHotkeys(
    {
      'mod+1': () => setActiveTab('standup'),
      'mod+2': () => setActiveTab('timeline'),
      'mod+3': () => setActiveTab('settings'),
      'mod+r': () => {
        if (isBusy) return;
        refresh();
      },
      'mod+enter': () => {
        if (isBusy || !hasPrs) return;
        void report.regenerateSummary();
      },
      'mod+c': () => {
        if (window.getSelection()?.toString() || isBusy || !canCopy) return false; // giữ copy mặc định khi bôi đen
        void report.copySummary();
      },
      'mod+p': () => {
        if (isBusy || !canReveal) return;
        void report.revealDestination();
      },
      'mod+,': () => setActiveTab((tab) => (tab === 'settings' ? 'standup' : 'settings')),
      escape: isSettingsModalOpen && (() => setIsSettingsModalOpen(false)),
    },
    {
      enabled: boot.isReady,
      enableInInputs: ['escape', 'mod+r', 'mod+,', 'mod+1', 'mod+2', 'mod+3'],
    },
  );

  return (
    <AppLayout
      theme="github-report"
      splash={
        !boot.isReady && (
          <AppSplashScreen
            icon={
              <div className="relative">
                <GitPullRequest className="h-10 w-10 text-sky-400" />
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/20">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-indigo-300 [animation-duration:4s]" />
                </div>
              </div>
            }
            title="GitHub Report"
            progress={boot.progress}
            message={boot.message}
            isExiting={boot.phase === 'exiting'}
          />
        )
      }
      header={
        <UnifiedHeader
          dateMode={dateMode}
          onDateModeChange={changeDateMode}
          prCount={report.prs?.length}
          commitCount={report.totalCommits}
          isBusy={isBusy}
          canCopy={canCopy}
          isCopied={report.isCopied}
          destinationLabel={getDestinationLabel(settings)}
          canReveal={canReveal}
          onRefresh={refresh}
          onCopySummary={() => void report.copySummary()}
          onRevealDestination={() => void report.revealDestination()}
          onOpenSettings={() => setActiveTab('settings')}
        />
      }
      sidebar={
        <AppSidebar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as GithubReportTab)}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
          title="Điều Hướng"
        />
      }
      footer={<StatusBar status={report.status} prereqStatus={prereqStatus} />}
      overlays={
        isSettingsModalOpen && (
          <SettingsModal
            isOpen
            onClose={() => setIsSettingsModalOpen(false)}
            settings={settings}
            onSaveSettings={(next) => void appSettings.save(next)}
            prereqStatus={prereqStatus}
            onSaveToken={saveToken}
          />
        )
      }
      mainClassName="p-4.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar"
    >
      {activeTab === 'standup' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <AISummaryCard
            summary={summaryTask.data}
            isLoading={isBusy}
            loadingLabel={
              prsTask.isRunning ? 'Đang chờ dữ liệu PR & commits…' : 'Đang tóm tắt bằng Local AI…'
            }
            error={summaryTask.error}
            canGenerate={hasPrs && !prsTask.isRunning}
            isCopied={report.isCopied}
            onGenerate={() => void report.regenerateSummary()}
            onCopy={() => void report.copySummary()}
            onUpdateBullets={report.updateBullets}
            dateMode={dateMode}
            onDateModeChange={changeDateMode}
          />
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <PRTimelineCard
            prs={report.prs}
            isLoading={prsTask.isRunning}
            isBusy={isBusy}
            error={prsTask.error}
            selectedPrNumbers={report.selectedPrNumbers}
            onTogglePr={report.togglePr}
            onSetAllSelected={report.setAllSelected}
            dateMode={dateMode}
            onDateModeChange={changeDateMode}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <SettingsView
            settings={settings}
            onSaveSettings={(next) => void appSettings.save(next)}
            prereqStatus={prereqStatus}
            onSaveToken={saveToken}
          />
        </div>
      )}
    </AppLayout>
  );
}

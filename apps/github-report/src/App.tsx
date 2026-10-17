import { useState } from 'react';
import { GitPullRequest, Sparkles } from 'lucide-react';
import { AppSplashScreen, AppLayout, useAppBootstrap, useHotkeys, useLatestRef } from '@nexus/ui';
import { UnifiedHeader } from './components/UnifiedHeader';
import { AISummaryCard } from './components/AISummaryCard';
import { PRTimelineCard } from './components/PRTimelineCard';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { useAppSettings } from './hooks/use-app-settings';
import { useGithubReport } from './hooks/use-github-report';
import { githubReportApi } from './services/github-report-api';
import { getDestinationLabel } from './lib/report-utils';
import type { DateMode, PrereqStatus } from './types';

/**
 * Luồng UI (xem docs/mini-app-guide.md):
 * 1. Splash: nạp settings + kiểm tra môi trường (useAppBootstrap, chạy đúng 1 lần).
 * 2. onReady → loadReport(): quét PR (skeleton) → tóm tắt AI (skeleton/thanh mảnh).
 * 3. Mọi lần chạy lại đều do người dùng kích hoạt (⌘R, đổi ngày, Tóm tắt lại) — không có
 *    useEffect nào tự gọi API, nên không thể xảy ra vòng lặp.
 */
export default function App() {
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      'mod+,': () => setIsSettingsOpen((open) => !open),
      escape: isSettingsOpen && (() => setIsSettingsOpen(false)),
    },
    { enabled: boot.isReady, enableInInputs: ['escape', 'mod+r', 'mod+,'] },
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
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      }
      footer={<StatusBar status={report.status} prereqStatus={prereqStatus} />}
      overlays={
        // Mount lại mỗi lần mở → form luôn khởi tạo từ settings mới nhất (không phải mặc định).
        isSettingsOpen && (
          <SettingsModal
            isOpen
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSaveSettings={(next) => void appSettings.save(next)}
            prereqStatus={prereqStatus}
            onSaveToken={saveToken}
          />
        )
      }
      mainClassName="gap-2.5 overflow-hidden p-3"
    >
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
      />

      <PRTimelineCard
        prs={report.prs}
        isLoading={prsTask.isRunning}
        isBusy={isBusy}
        error={prsTask.error}
        selectedPrNumbers={report.selectedPrNumbers}
        onTogglePr={report.togglePr}
        onSetAllSelected={report.setAllSelected}
      />
    </AppLayout>
  );
}

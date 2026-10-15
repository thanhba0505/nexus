import { useState } from 'react';
import { GitPullRequest, Sparkles } from 'lucide-react';
import { AppSplashScreen } from '@nexus/ui';
import { UnifiedHeader } from './components/UnifiedHeader';
import { AISummaryCard } from './components/AISummaryCard';
import { PRTimelineCard } from './components/PRTimelineCard';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { useSplashScreen } from './hooks/use-splash-screen';
import { useGithubReport } from './hooks/use-github-report';
import { useGlobalShortcuts } from './hooks/use-global-shortcuts';
import { saveSettings } from './services/storage';
import { DateMode, AppSettings } from './types';
import { invoke } from '@tauri-apps/api/core';

export default function App() {
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // 1. Hook quản lý Splash Screen & Nạp cấu hình khởi động
  const {
    isAppReady,
    isExitingSplash,
    initProgress,
    initMessage,
    settings,
    setSettings,
    prereqStatus,
    setPrereqStatus,
  } = useSplashScreen();

  // 2. Hook quản lý toàn bộ luồng PR, Commits & Local AI tóm tắt (Web-like async flow)
  const {
    prs,
    selectedPrNumbers,
    totalCommitsCount,
    summaryBullets,
    setSummaryBullets,
    summaryProvider,
    isLoadingPrs,
    isSummarizing,
    statusText,
    isStatusError,
    isCopied,
    fetchPrs,
    generateSummary,
    togglePr,
    selectAll,
    deselectAll,
    copySummary,
    revealDestination,
  } = useGithubReport({
    isAppReady,
    dateMode,
    settings,
  });

  // 3. Hook quản lý phím tắt macOS toàn cục (⌘R, ⌘C, ⌘P, ⌘,, ⌘↵, Esc)
  useGlobalShortcuts({
    onFetch: fetchPrs,
    onSummarize: () => generateSummary(),
    onCopy: () => copySummary(),
    onRevealDestination: revealDestination,
    onToggleSettings: () => setIsSettingsOpen((prev) => !prev),
    isSettingsOpen,
    onCloseSettings: () => setIsSettingsOpen(false),
  });

  // Lưu cài đặt
  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Lưu token vào Keychain
  const handleSaveToken = async (token: string) => {
    await invoke('save_github_token', { token });
    const prereq = await invoke<typeof prereqStatus>('check_prerequisites');
    setPrereqStatus(prereq);
  };

  const destinationLabel =
    settings.workflow.destination === 'parabol'
      ? 'Parabol'
      : settings.workflow.destination === 'slack'
        ? 'Slack'
        : 'Copy';

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950/85 text-white font-sans overflow-hidden select-none relative">
      {/* 1. Màn hình khởi động SplashScreen dùng chung từ @nexus/ui */}
      {!isAppReady && (
        <AppSplashScreen
          icon={
            <div className="relative">
              <GitPullRequest className="w-10 h-10 text-sky-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
                <Sparkles
                  className="w-3.5 h-3.5 text-indigo-300 animate-spin"
                  style={{ animationDuration: '4s' }}
                />
              </div>
            </div>
          }
          title="GitHub Report"
          version="v0.4.0"
          progress={initProgress}
          message={initMessage}
          isExiting={isExitingSplash}
        />
      )}

      {/* 2. Unified Custom Header (Tận dụng MiniAppHeader từ @nexus/ui) */}
      <UnifiedHeader
        dateMode={dateMode}
        onDateModeChange={setDateMode}
        prCount={prs.length}
        commitCount={totalCommitsCount}
        isLoading={isLoadingPrs || isSummarizing}
        isCopied={isCopied}
        destinationLabel={destinationLabel}
        onFetch={fetchPrs}
        onCopySummary={() => copySummary()}
        onRevealDestination={revealDestination}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Main Body: 2 Card Tầng (AI Summary + PR Timeline) */}
      <main className="flex-1 min-h-0 flex flex-col p-3.5 gap-3 overflow-hidden">
        {/* Card Tóm Tắt AI (Loading spinner khi isSummarizing = true) */}
        <AISummaryCard
          bullets={summaryBullets}
          provider={summaryProvider}
          isLoading={isSummarizing}
          onUpdateBullets={setSummaryBullets}
          onCopy={() => copySummary()}
          isCopied={isCopied}
          hasPrs={prs.length > 0}
          onGenerateSummary={() => generateSummary()}
        />

        {/* Card Danh Sách PR & Commit Timeline (Skeleton loader khi isLoadingPrs = true) */}
        <PRTimelineCard
          prs={prs}
          selectedPrNumbers={selectedPrNumbers}
          isLoading={isLoadingPrs}
          onTogglePr={togglePr}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />
      </main>

      {/* 4. Status Bar dưới cùng */}
      <StatusBar statusText={statusText} isError={isStatusError} prereqStatus={prereqStatus} />

      {/* 5. Settings Modal (⌘,) - Người dùng tự do mở bất kỳ lúc nào */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        prereqStatus={prereqStatus}
        onSaveToken={handleSaveToken}
      />
    </div>
  );
}

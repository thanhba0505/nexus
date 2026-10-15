import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { UnifiedHeader } from './components/UnifiedHeader';
import { AISummaryCard } from './components/AISummaryCard';
import { PRTimelineCard } from './components/PRTimelineCard';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { AppSplashScreen, InitStepItem } from './components/AppSplashScreen';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './services/storage';
import { PRReportItem, AISummaryResult, PrereqStatus, AppSettings, DateMode } from './types';

export default function App() {
  // Trạng thái màn hình khởi động (Splash Screen)
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [isExitingSplash, setIsExitingSplash] = useState<boolean>(false);
  const [initProgress, setInitProgress] = useState<number>(10);
  const [initMessage, setInitMessage] = useState<string>('Khởi tạo hệ sinh thái...');
  const [initSteps, setInitSteps] = useState<InitStepItem[]>([
    { id: 'settings', label: 'Nạp cấu hình & prompt template', status: 'pending' },
    { id: 'prereqs', label: 'Kiểm tra CLI (gh, agy) & Keychain', status: 'pending' },
    { id: 'prs', label: 'Quét Pull Requests & commits', status: 'pending' },
  ]);

  // Settings & state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [prs, setPrs] = useState<PRReportItem[]>([]);
  const [selectedPrNumbers, setSelectedPrNumbers] = useState<Set<number>>(new Set());

  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);
  const [summaryProvider, setSummaryProvider] = useState<string>('');

  const [isLoadingPrs, setIsLoadingPrs] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const [statusText, setStatusText] = useState<string>('Đang khởi tạo...');
  const [isStatusError, setIsStatusError] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [prereqStatus, setPrereqStatus] = useState<PrereqStatus | null>(null);

  // Tính toán mốc thời gian since ISO theo DateMode
  const sinceIsoString = useMemo(() => {
    const now = new Date();
    if (dateMode === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return todayStart.toISOString();
    } else {
      // Last Workday: Nếu là thứ Hai (1), lùi về thứ Sáu (3 ngày trước)
      const day = now.getDay();
      const daysToSubtract = day === 1 ? 3 : day === 0 ? 2 : 1;
      const targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysToSubtract,
        0,
        0,
        0,
        0,
      );
      return targetDate.toISOString();
    }
  }, [dateMode]);

  // Đếm tổng số commit
  const totalCommitsCount = useMemo(() => {
    return prs.reduce((acc, p) => acc + p.commits.length, 0);
  }, [prs]);

  // Tự động sao chép vào clipboard
  const copyToClipboard = useCallback((text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Mở hoặc chuyển tab Parabol / Slack theo cấu hình
  const handleRevealDestinationWithSettings = useCallback(async (targetSettings: AppSettings) => {
    try {
      const url =
        targetSettings.workflow.destination === 'parabol'
          ? targetSettings.workflow.parabolUrl || 'https://action.parabol.co'
          : 'https://app.slack.com';

      await invoke('reveal_browser_tab', {
        url,
        browserName: targetSettings.workflow.browser,
      });

      setStatusText(`✓ Đã kích hoạt tab ${targetSettings.workflow.destination} trên trình duyệt`);
      setIsStatusError(false);
    } catch (err) {
      console.warn('Lỗi mở trình duyệt:', err);
    }
  }, []);

  const handleRevealDestination = useCallback(() => {
    handleRevealDestinationWithSettings(settingsRef.current);
  }, [handleRevealDestinationWithSettings]);

  // Tóm tắt AI cho các PR được chọn
  const handleGenerateSummary = useCallback(
    async (itemsToSummarize: PRReportItem[], overrideSettings?: AppSettings) => {
      const activeSettings = overrideSettings || settingsRef.current;
      if (itemsToSummarize.length === 0) {
        setSummaryBullets([]);
        setSummaryProvider('');
        return;
      }

      setIsSummarizing(true);
      setStatusText('Đang tóm tắt bằng Local AI...');
      setIsStatusError(false);

      try {
        const result = await invoke<AISummaryResult>('generate_ai_summary', {
          prs: itemsToSummarize,
          promptTemplate: activeSettings.ai.promptTemplate || undefined,
          providerPreference: activeSettings.ai.provider || undefined,
        });

        setSummaryBullets(result.bullets);
        setSummaryProvider(result.provider);

        const formatted = ['Today:', '', ...result.bullets.map((b) => `• ${b}`)].join('\n');

        if (activeSettings.workflow.autoCopy) {
          copyToClipboard(formatted);
        }

        // BẢO ĐẢM TUYỆT ĐỐI: Chỉ tự mở trình duyệt khi người dùng bật revealBrowser = true
        if (
          activeSettings.workflow.revealBrowser &&
          activeSettings.workflow.destination !== 'copy_only'
        ) {
          handleRevealDestinationWithSettings(activeSettings);
        }

        setStatusText(
          `✓ Đã tóm tắt (${result.provider}) • ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
        );
      } catch (err) {
        console.warn('Lỗi tóm tắt AI:', err);
        setStatusText(`Lỗi tóm tắt: ${String(err)}`);
        setIsStatusError(true);
      } finally {
        setIsSummarizing(false);
      }
    },
    [copyToClipboard, handleRevealDestinationWithSettings],
  );

  // Quét PR & Commit từ GitHub
  const handleFetch = useCallback(async () => {
    setIsLoadingPrs(true);
    setStatusText('Đang quét PR & commits từ GitHub...');
    setIsStatusError(false);

    try {
      const items = await invoke<PRReportItem[]>('fetch_github_prs', {
        sinceIso: sinceIsoString,
      });

      setPrs(items);
      const allNumbers = new Set(items.map((p) => p.number));
      setSelectedPrNumbers(allNumbers);

      if (items.length > 0) {
        setStatusText(
          `Tìm thấy ${items.length} PRs (${items.reduce((s, p) => s + p.commits.length, 0)} commits)`,
        );
        handleGenerateSummary(items);
      } else {
        setSummaryBullets([]);
        setStatusText('Không có PR hoặc commit nào trong khoảng thời gian này.');
      }
    } catch (err) {
      console.warn('Lỗi quét PR:', err);
      setStatusText(`Lỗi GitHub CLI: ${String(err)}`);
      setIsStatusError(true);
    } finally {
      setIsLoadingPrs(false);
    }
  }, [sinceIsoString, handleGenerateSummary]);

  // Luồng nạp toàn diện khi khởi động ứng dụng (Splash sequence)
  useEffect(() => {
    let isMounted = true;

    const runStartupSequence = async () => {
      try {
        // Bước 1: Nạp file cấu hình settings.json & prompt templates
        setInitSteps((prev) =>
          prev.map((s) => (s.id === 'settings' ? { ...s, status: 'running' } : s)),
        );
        setInitMessage('Đang nạp cấu hình settings.json...');
        setInitProgress(25);

        const loadedSettings = await loadSettings();
        if (!isMounted) return;
        setSettings(loadedSettings);
        settingsRef.current = loadedSettings;
        setInitSteps((prev) =>
          prev.map((s) => (s.id === 'settings' ? { ...s, status: 'done' } : s)),
        );
        setInitProgress(45);

        // Bước 2: Kiểm tra công cụ hệ thống (gh CLI, agy/claude CLI, Keychain)
        setInitSteps((prev) =>
          prev.map((s) => (s.id === 'prereqs' ? { ...s, status: 'running' } : s)),
        );
        setInitMessage('Kiểm tra GitHub CLI & Local AI...');
        setInitProgress(65);

        const prereq = await invoke<PrereqStatus>('check_prerequisites');
        if (!isMounted) return;
        setPrereqStatus(prereq);
        setInitSteps((prev) =>
          prev.map((s) => (s.id === 'prereqs' ? { ...s, status: 'done' } : s)),
        );
        setInitProgress(80);

        // Bước 3: Quét PRs ban đầu
        setInitSteps((prev) => prev.map((s) => (s.id === 'prs' ? { ...s, status: 'running' } : s)));
        setInitMessage('Quét Pull Requests & commits...');
        setInitProgress(90);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        let initialPrs: PRReportItem[] = [];

        try {
          initialPrs = await invoke<PRReportItem[]>('fetch_github_prs', {
            sinceIso: todayStart.toISOString(),
          });
        } catch (fetchErr) {
          console.warn('Lỗi quét PR ban đầu:', fetchErr);
        }

        if (!isMounted) return;
        setPrs(initialPrs);
        const allNumbers = new Set(initialPrs.map((p) => p.number));
        setSelectedPrNumbers(allNumbers);

        setInitSteps((prev) => prev.map((s) => (s.id === 'prs' ? { ...s, status: 'done' } : s)));
        setInitProgress(100);
        setInitMessage('Hệ thống đã sẵn sàng!');

        // Đợi 250ms cho người dùng nhìn thấy tiến trình 100%
        await new Promise((r) => setTimeout(r, 250));
        if (!isMounted) return;
        setIsExitingSplash(true);

        // Đợi 400ms fade-out transition kết thúc rồi chuyển sang app chính
        await new Promise((r) => setTimeout(r, 400));
        if (!isMounted) return;
        setIsAppReady(true);

        if (initialPrs.length > 0) {
          setStatusText(
            `Tìm thấy ${initialPrs.length} PRs (${initialPrs.reduce((s, p) => s + p.commits.length, 0)} commits). Sẵn sàng tạo tóm tắt.`,
          );
        } else {
          setStatusText('Sẵn sàng. Không có PR mới hôm nay.');
        }
      } catch (err) {
        console.warn('Lỗi khởi tạo hệ thống:', err);
        if (!isMounted) return;
        setIsExitingSplash(true);
        setTimeout(() => setIsAppReady(true), 400);
        setStatusText('Sẵn sàng (Offline)');
      }
    };

    runStartupSequence();

    return () => {
      isMounted = false;
    };
  }, [handleGenerateSummary]);

  // Khi thay đổi khoảng ngày và app ĐÃ SẴN SÀNG -> Quét lại PRs
  useEffect(() => {
    if (!isAppReady) return;
    handleFetch();
  }, [dateMode, isAppReady, handleFetch]);

  // Sao chép tóm tắt
  const handleCopySummary = () => {
    if (summaryBullets.length > 0) {
      const formatted = ['Today:', '', ...summaryBullets.map((b) => `• ${b}`)].join('\n');
      copyToClipboard(formatted);
      setStatusText('✓ Đã sao chép tóm tắt vào Clipboard');
      setIsStatusError(false);
    }
  };

  // Toggle PR trong danh sách chọn
  const handleTogglePr = (prNumber: number) => {
    setSelectedPrNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(prNumber)) {
        next.delete(prNumber);
      } else {
        next.add(prNumber);
      }

      // Tóm tắt lại theo danh sách mới
      const filtered = prs.filter((p) => next.has(p.number));
      handleGenerateSummary(filtered);
      return next;
    });
  };

  const handleSelectAll = () => {
    const all = new Set(prs.map((p) => p.number));
    setSelectedPrNumbers(all);
    handleGenerateSummary(prs);
  };

  const handleDeselectAll = () => {
    setSelectedPrNumbers(new Set());
    setSummaryBullets([]);
  };

  // Lưu cài đặt
  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    settingsRef.current = newSettings;
    await saveSettings(newSettings);
    setStatusText('✓ Đã lưu cài đặt mới');
    setIsStatusError(false);
  };

  // Lưu token vào Keychain
  const handleSaveToken = async (token: string) => {
    await invoke('save_github_token', { token });
    const prereq = await invoke<PrereqStatus>('check_prerequisites');
    setPrereqStatus(prereq);
  };

  // Lắng nghe phím tắt toàn cục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'r') {
          e.preventDefault();
          handleFetch();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const filtered = prs.filter((p) => selectedPrNumbers.has(p.number));
          handleGenerateSummary(filtered.length > 0 ? filtered : prs);
        } else if (e.key === 'c' && !window.getSelection()?.toString()) {
          e.preventDefault();
          handleCopySummary();
        } else if (e.key === 'p') {
          e.preventDefault();
          handleRevealDestination();
        } else if (e.key === ',') {
          e.preventDefault();
          setIsSettingsOpen((prev) => !prev);
        }
      } else if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleFetch,
    handleGenerateSummary,
    handleRevealDestination,
    isSettingsOpen,
    prs,
    selectedPrNumbers,
  ]);

  const destinationLabel =
    settings.workflow.destination === 'parabol'
      ? 'Parabol'
      : settings.workflow.destination === 'slack'
        ? 'Slack'
        : 'Copy';

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950/85 text-white font-sans overflow-hidden select-none relative">
      {/* 1. Màn hình khởi động SplashScreen (Nạp hết code, settings, kiểm tra công cụ) */}
      {!isAppReady && (
        <AppSplashScreen
          progress={initProgress}
          currentMessage={initMessage}
          steps={initSteps}
          isExiting={isExitingSplash}
        />
      )}

      {/* 2. Unified Custom Header (Tích hợp Traffic Lights macOS) */}
      <UnifiedHeader
        dateMode={dateMode}
        onDateModeChange={setDateMode}
        prCount={prs.length}
        commitCount={totalCommitsCount}
        isLoading={isLoadingPrs || isSummarizing}
        isCopied={isCopied}
        destinationLabel={destinationLabel}
        onFetch={handleFetch}
        onCopySummary={handleCopySummary}
        onRevealDestination={handleRevealDestination}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Main Body: 2 Card Tầng (AI Summary + PR Timeline) */}
      <main className="flex-1 min-h-0 flex flex-col p-3.5 gap-3 overflow-hidden">
        {/* Card Tóm Tắt AI */}
        <AISummaryCard
          bullets={summaryBullets}
          provider={summaryProvider}
          isLoading={isSummarizing}
          onUpdateBullets={setSummaryBullets}
          onCopy={handleCopySummary}
          isCopied={isCopied}
          hasPrs={prs.length > 0}
          onGenerateSummary={() => {
            const filtered = prs.filter((p) => selectedPrNumbers.has(p.number));
            handleGenerateSummary(filtered.length > 0 ? filtered : prs);
          }}
        />

        {/* Card Danh Sách PR & Commit Timeline */}
        <PRTimelineCard
          prs={prs}
          selectedPrNumbers={selectedPrNumbers}
          onTogglePr={handleTogglePr}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      </main>

      {/* 4. Status Bar dưới cùng */}
      <StatusBar statusText={statusText} isError={isStatusError} prereqStatus={prereqStatus} />

      {/* 5. Settings Modal (⌘,) */}
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

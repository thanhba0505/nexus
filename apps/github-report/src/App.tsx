import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { UnifiedHeader } from './components/UnifiedHeader';
import { AISummaryCard } from './components/AISummaryCard';
import { PRTimelineCard } from './components/PRTimelineCard';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { AppSplashScreen } from './components/AppSplashScreen';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './services/storage';
import { PRReportItem, AISummaryResult, PrereqStatus, AppSettings, DateMode } from './types';

export default function App() {
  // Trạng thái màn hình khởi động (Splash Screen: chỉ Icon + Progress bar)
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [isExitingSplash, setIsExitingSplash] = useState<boolean>(false);
  const [initProgress, setInitProgress] = useState<number>(15);
  const [initMessage, setInitMessage] = useState<string>('Đang nạp cấu hình...');

  // Settings & ref
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

  const [statusText, setStatusText] = useState<string>('Sẵn sàng');
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

  // Tóm tắt AI cho các PR được chọn (Chạy bất đồng bộ ngầm)
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

        // BẢO ĐẢM: Chỉ mở trình duyệt khi người dùng chủ động cấu hình revealBrowser = true
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

  // 1. Luồng khởi động (Splash Screen): Nạp cấu hình & kiểm tra môi trường nhanh gọn
  useEffect(() => {
    let isMounted = true;

    const runStartup = async () => {
      try {
        setInitMessage('Nạp cấu hình hệ thống...');
        setInitProgress(30);

        const loadedSettings = await loadSettings();
        if (!isMounted) return;
        setSettings(loadedSettings);
        settingsRef.current = loadedSettings;
        setInitProgress(65);

        setInitMessage('Kiểm tra môi trường CLI & Keychain...');
        const prereq = await invoke<PrereqStatus>('check_prerequisites');
        if (!isMounted) return;
        setPrereqStatus(prereq);
        setInitProgress(100);
        setInitMessage('Sẵn sàng!');

        // Đợi 200ms để hiệu ứng mượt
        await new Promise((r) => setTimeout(r, 200));
        if (!isMounted) return;
        setIsExitingSplash(true);

        // Sau 300ms fade-out, chính thức vào app
        await new Promise((r) => setTimeout(r, 300));
        if (!isMounted) return;
        setIsAppReady(true);
      } catch (err) {
        console.warn('Lỗi khởi tạo hệ thống:', err);
        if (!isMounted) return;
        setIsExitingSplash(true);
        setTimeout(() => setIsAppReady(true), 300);
      }
    };

    runStartup();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sau khi vào app chính (hoặc khi đổi ngày):
  // Load commits bất đồng bộ -> Load xong thì tự động trigger AI tóm tắt
  useEffect(() => {
    if (!isAppReady) return;

    let isCancelled = false;

    const loadDataAndAutoSummarize = async () => {
      setIsLoadingPrs(true);
      setStatusText('Đang quét PR & commits từ GitHub...');
      setIsStatusError(false);

      try {
        const items = await invoke<PRReportItem[]>('fetch_github_prs', {
          sinceIso: sinceIsoString,
        });

        if (isCancelled) return;
        setPrs(items);
        const allNumbers = new Set(items.map((p) => p.number));
        setSelectedPrNumbers(allNumbers);
        setIsLoadingPrs(false);

        if (items.length > 0) {
          setStatusText(
            `Tìm thấy ${items.length} PRs (${items.reduce((s, p) => s + p.commits.length, 0)} commits). Đang tóm tắt bằng AI...`,
          );
          // Tự động trigger AI tóm tắt (hoàn toàn bất đồng bộ, không khóa giao diện)
          handleGenerateSummary(items, settingsRef.current);
        } else {
          setSummaryBullets([]);
          setStatusText('Không có PR hoặc commit nào trong khoảng thời gian này.');
        }
      } catch (err) {
        if (isCancelled) return;
        console.warn('Lỗi quét PR:', err);
        setStatusText(`Lỗi GitHub CLI: ${String(err)}`);
        setIsStatusError(true);
        setIsLoadingPrs(false);
      }
    };

    loadDataAndAutoSummarize();

    return () => {
      isCancelled = true;
    };
  }, [isAppReady, sinceIsoString, handleGenerateSummary]);

  // Quét thủ công lại (Ví dụ bấm nút Refresh ⌘R)
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
      setIsLoadingPrs(false);

      if (items.length > 0) {
        setStatusText(
          `Tìm thấy ${items.length} PRs (${items.reduce((s, p) => s + p.commits.length, 0)} commits)`,
        );
        handleGenerateSummary(items, settingsRef.current);
      } else {
        setSummaryBullets([]);
        setStatusText('Không có PR hoặc commit nào trong khoảng thời gian này.');
      }
    } catch (err) {
      console.warn('Lỗi quét PR:', err);
      setStatusText(`Lỗi GitHub CLI: ${String(err)}`);
      setIsStatusError(true);
      setIsLoadingPrs(false);
    }
  }, [sinceIsoString, handleGenerateSummary]);

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
      {/* 1. Màn hình khởi động SplashScreen (Chỉ Icon app và Thanh tiến trình) */}
      {!isAppReady && (
        <AppSplashScreen
          progress={initProgress}
          message={initMessage}
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
        {/* Card Tóm Tắt AI (Hiển thị loading khi isSummarizing = true) */}
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

        {/* Card Danh Sách PR & Commit Timeline (Hiển thị skeleton loading khi isLoadingPrs = true) */}
        <PRTimelineCard
          prs={prs}
          selectedPrNumbers={selectedPrNumbers}
          isLoading={isLoadingPrs}
          onTogglePr={handleTogglePr}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
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

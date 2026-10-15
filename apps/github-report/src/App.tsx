import { useState, useEffect, useMemo, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { UnifiedHeader } from './components/UnifiedHeader';
import { AISummaryCard } from './components/AISummaryCard';
import { PRTimelineCard } from './components/PRTimelineCard';
import { StatusBar } from './components/StatusBar';
import { SettingsModal } from './components/SettingsModal';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './services/storage';
import { PRReportItem, AISummaryResult, PrereqStatus, AppSettings, DateMode } from './types';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [prs, setPrs] = useState<PRReportItem[]>([]);
  const [selectedPrNumbers, setSelectedPrNumbers] = useState<Set<number>>(new Set());

  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);
  const [summaryProvider, setSummaryProvider] = useState<string>('');

  const [isLoadingPrs, setIsLoadingPrs] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const [statusText, setStatusText] = useState<string>('Đang tải cấu hình...');
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

  // Load settings và kiểm tra công cụ khi mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const loaded = await loadSettings();
        setSettings(loaded);

        const prereq = await invoke<PrereqStatus>('check_prerequisites');
        setPrereqStatus(prereq);
        setStatusText('Sẵn sàng');
      } catch (err) {
        console.warn('Lỗi khởi tạo:', err);
        setStatusText('Sẵn sàng (Offline)');
      }
    };

    initApp();
  }, []);

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

  // Mở hoặc chuyển tab Parabol / Slack
  const handleRevealDestination = useCallback(async () => {
    try {
      const url =
        settings.workflow.destination === 'parabol'
          ? settings.workflow.parabolUrl || 'https://action.parabol.co'
          : 'https://app.slack.com';

      await invoke('reveal_browser_tab', {
        url,
        browserName: settings.workflow.browser,
      });

      setStatusText(`✓ Đã kích hoạt tab ${settings.workflow.destination} trên trình duyệt`);
      setIsStatusError(false);
    } catch (err) {
      console.warn('Lỗi mở trình duyệt:', err);
    }
  }, [settings]);

  // Tóm tắt AI cho các PR được chọn
  const handleGenerateSummary = useCallback(
    async (itemsToSummarize: PRReportItem[]) => {
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
          promptTemplate: settings.ai.promptTemplate || undefined,
          providerPreference: settings.ai.provider || undefined,
        });

        setSummaryBullets(result.bullets);
        setSummaryProvider(result.provider);

        const formatted = ['Today:', '', ...result.bullets.map((b) => `• ${b}`)].join('\n');

        if (settings.workflow.autoCopy) {
          copyToClipboard(formatted);
        }

        if (settings.workflow.revealBrowser && settings.workflow.destination !== 'copy_only') {
          handleRevealDestination();
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
    [settings, copyToClipboard, handleRevealDestination],
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
        // Tự động tóm tắt luôn
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

  // Tự động fetch khi thay đổi khoảng ngày (Hôm nay / Ngày trước)
  useEffect(() => {
    handleFetch();
  }, [dateMode, handleFetch]);

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
  }, [handleFetch, isSettingsOpen]);

  const destinationLabel =
    settings.workflow.destination === 'parabol'
      ? 'Parabol'
      : settings.workflow.destination === 'slack'
        ? 'Slack'
        : 'Copy';

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950/85 text-white font-sans overflow-hidden select-none">
      {/* 1. Unified Custom Header (Tích hợp Traffic Lights macOS) */}
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

      {/* 2. Main Body: 2 Card Tầng (AI Summary + PR Timeline) */}
      <main className="flex-1 min-h-0 flex flex-col p-3.5 gap-3 overflow-hidden">
        {/* Card Tóm Tắt AI */}
        <AISummaryCard
          bullets={summaryBullets}
          provider={summaryProvider}
          isLoading={isSummarizing}
          onUpdateBullets={setSummaryBullets}
          onCopy={handleCopySummary}
          isCopied={isCopied}
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

      {/* 3. Status Bar dưới cùng */}
      <StatusBar statusText={statusText} isError={isStatusError} prereqStatus={prereqStatus} />

      {/* 4. Settings Modal (⌘,) */}
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

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PRReportItem, AISummaryResult, AppSettings, DateMode } from '../types';

export interface UseGithubReportOptions {
  isAppReady: boolean;
  dateMode: DateMode;
  settings: AppSettings;
}

export function useGithubReport({ isAppReady, dateMode, settings }: UseGithubReportOptions) {
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const [prs, setPrs] = useState<PRReportItem[]>([]);
  const [selectedPrNumbers, setSelectedPrNumbers] = useState<Set<number>>(new Set());

  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);
  const [summaryProvider, setSummaryProvider] = useState<string>('');

  const [isLoadingPrs, setIsLoadingPrs] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const [statusText, setStatusText] = useState<string>('Sẵn sàng');
  const [isStatusError, setIsStatusError] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

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

  // Sao chép nội dung vào Clipboard
  const copySummary = useCallback(
    (overrideText?: string) => {
      const textToCopy =
        overrideText ||
        (summaryBullets.length > 0
          ? ['Today:', '', ...summaryBullets.map((b) => `• ${b}`)].join('\n')
          : '');

      if (!textToCopy) return false;

      try {
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        setStatusText('✓ Đã sao chép tóm tắt vào Clipboard');
        setIsStatusError(false);
        return true;
      } catch {
        return false;
      }
    },
    [summaryBullets],
  );

  // Kích hoạt tab trình duyệt Parabol / Slack
  const revealDestination = useCallback(async () => {
    const current = settingsRef.current;
    try {
      const url =
        current.workflow.destination === 'parabol'
          ? current.workflow.parabolUrl || 'https://action.parabol.co'
          : 'https://app.slack.com';

      await invoke('reveal_browser_tab', {
        url,
        browserName: current.workflow.browser,
      });

      setStatusText(`✓ Đã kích hoạt tab ${current.workflow.destination} trên trình duyệt`);
      setIsStatusError(false);
    } catch (err) {
      console.warn('Lỗi mở trình duyệt:', err);
    }
  }, []);

  // Tóm tắt AI ngầm không khóa giao diện
  const generateSummary = useCallback(
    async (itemsToSummarize?: PRReportItem[]) => {
      const current = settingsRef.current;
      const targetPrs = itemsToSummarize || prs.filter((p) => selectedPrNumbers.has(p.number));
      const finalItems = targetPrs.length > 0 ? targetPrs : prs;

      if (finalItems.length === 0) {
        setSummaryBullets([]);
        setSummaryProvider('');
        return;
      }

      setIsSummarizing(true);
      setStatusText('Đang tóm tắt bằng Local AI...');
      setIsStatusError(false);

      try {
        const result = await invoke<AISummaryResult>('generate_ai_summary', {
          prs: finalItems,
          promptTemplate: current.ai.promptTemplate || undefined,
          providerPreference: current.ai.provider || undefined,
        });

        setSummaryBullets(result.bullets);
        setSummaryProvider(result.provider);

        const formatted = ['Today:', '', ...result.bullets.map((b) => `• ${b}`)].join('\n');

        if (current.workflow.autoCopy) {
          copySummary(formatted);
        }

        if (current.workflow.revealBrowser && current.workflow.destination !== 'copy_only') {
          revealDestination();
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
    [prs, selectedPrNumbers, copySummary, revealDestination],
  );

  // Quét PR & commits từ GitHub (hàm thủ công)
  const fetchPrs = useCallback(async () => {
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
        generateSummary(items);
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
  }, [sinceIsoString, generateSummary]);

  // Luồng tự động khi vào app chính hoặc đổi khoảng ngày:
  // 1. Quét PR & commits (hiển thị skeleton)
  // 2. Tự động trigger AI tóm tắt (hiển thị spinner AI, không khóa UI)
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
          // Tự động trigger AI tóm tắt bất đồng bộ
          generateSummary(items);
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
  }, [isAppReady, sinceIsoString, generateSummary]);

  // Thao tác danh sách chọn PR
  const togglePr = useCallback((prNumber: number) => {
    setSelectedPrNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(prNumber)) {
        next.delete(prNumber);
      } else {
        next.add(prNumber);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPrNumbers(new Set(prs.map((p) => p.number)));
  }, [prs]);

  const deselectAll = useCallback(() => {
    setSelectedPrNumbers(new Set());
    setSummaryBullets([]);
  }, []);

  return {
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
  };
}

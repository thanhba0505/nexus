import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { useAsyncTask, useLatestRef, useTransientValue, type StatusTone } from '@nexus/ui';
import { githubReportApi } from '../services/github-report-api';
import { formatSummaryText, formatTime, getDestinationUrl, getSinceIso } from '../lib/report-utils';
import type { AppSettings, DateMode, PRReportItem } from '../types';

export interface ReportStatus {
  message: string;
  tone: StatusTone;
}

export interface UseGithubReportOptions {
  /** Ref cấu hình mới nhất — đọc tại thời điểm chạy, không gây re-render/re-run. */
  settingsRef: RefObject<AppSettings>;
}

/**
 * Toàn bộ nghiệp vụ GitHub Report theo luồng **event-driven** (không có useEffect tự kích hoạt):
 *
 *   loadReport(mode) ──► fetch PRs ──► (có PR) ──► generate summary ──► autoCopy / reveal
 *
 * - Chỉ được gọi từ: `onReady` của bootstrap, nút/phím ⌘R, đổi khoảng ngày.
 * - Mỗi lần gọi tăng `generation`; kết quả của lần gọi cũ bị bỏ qua → không chồng chéo,
 *   không chạy autoCopy/reveal hai lần.
 * - `useAsyncTask` duy trì dữ liệu hiện có trong lúc làm mới (Stale-While-Revalidate).
 */
export function useGithubReport({ settingsRef }: UseGithubReportOptions) {
  const [selectedPrNumbers, setSelectedPrNumbers] = useState<Set<number>>(() => new Set());
  const [notice, showNotice] = useTransientValue<ReportStatus>(2500);
  const [isCopied, flashCopied] = useTransientValue<true>(2000);
  const generationRef = useRef(0);

  const prsTask = useAsyncTask((sinceIso: string) => githubReportApi.fetchPrs(sinceIso), {
    onSuccess: (items) => setSelectedPrNumbers(new Set(items.map((pr) => pr.number))),
  });

  const summaryTask = useAsyncTask(
    (items: PRReportItem[]) => githubReportApi.generateSummary(items, settingsRef.current.ai),
    // Khoá theo danh sách PR + commit để bấm lặp "Tóm tắt lại" không gọi AI chồng nhau.
    { getKey: (items) => items.map((pr) => `${pr.number}:${pr.commits.length}`).join(',') },
  );

  const prsRef = useLatestRef(prsTask.data);
  const bulletsRef = useLatestRef(summaryTask.data?.bullets);
  const selectedRef = useLatestRef(selectedPrNumbers);
  const isFetchingRef = useLatestRef(prsTask.isRunning);

  // ---- Hành động phụ (clipboard / trình duyệt) ------------------------------------------

  const copySummary = useCallback(
    async (bullets: string[] | undefined = bulletsRef.current) => {
      if (!bullets || bullets.length === 0) return false;
      try {
        await navigator.clipboard.writeText(formatSummaryText(bullets));
        flashCopied(true);
        showNotice({ tone: 'success', message: '✓ Đã sao chép tóm tắt vào Clipboard' });
        return true;
      } catch (err) {
        showNotice({ tone: 'error', message: `Không thể sao chép: ${String(err)}` });
        return false;
      }
    },
    [bulletsRef, flashCopied, showNotice],
  );

  const revealDestination = useCallback(async () => {
    const { workflow } = settingsRef.current;
    if (workflow.destination === 'copy_only') return;
    try {
      await githubReportApi.revealBrowserTab(getDestinationUrl(workflow), workflow.browser);
      showNotice({ tone: 'success', message: `✓ Đã mở ${workflow.destination} trên trình duyệt` });
    } catch (err) {
      showNotice({ tone: 'error', message: `Không mở được trình duyệt: ${String(err)}` });
    }
  }, [settingsRef, showNotice]);

  // ---- Luồng chính ----------------------------------------------------------------------

  const summarize = useCallback(
    async (items: PRReportItem[], generation: number) => {
      const result = await summaryTask.run(items);
      if (!result || generation !== generationRef.current) return;

      const { workflow } = settingsRef.current;
      if (workflow.autoCopy) await copySummary(result.bullets);
      if (workflow.revealBrowser) await revealDestination();
    },
    [copySummary, revealDestination, settingsRef, summaryTask.run],
  );

  /** Quét PR theo khoảng ngày rồi tự động tóm tắt. An toàn khi gọi liên tiếp (latest-wins). */
  const loadReport = useCallback(
    async (mode: DateMode) => {
      const generation = ++generationRef.current;
      summaryTask.cancel(); // tóm tắt cũ (nếu đang chạy) không còn hợp lệ

      const items = await prsTask.run(getSinceIso(mode));
      if (!items || generation !== generationRef.current) return;

      if (items.length === 0) {
        summaryTask.reset();
        return;
      }
      await summarize(items, generation);
    },
    [prsTask.run, summarize, summaryTask.cancel, summaryTask.reset],
  );

  /** Tóm tắt lại theo các PR đang được chọn (hoặc tất cả nếu không chọn PR nào). */
  const regenerateSummary = useCallback(async () => {
    if (isFetchingRef.current) return; // đang quét PR → loadReport sẽ tự tóm tắt sau
    const all = prsRef.current ?? [];
    const chosen = all.filter((pr) => selectedRef.current.has(pr.number));
    const items = chosen.length > 0 ? chosen : all;
    if (items.length === 0) return;
    await summarize(items, ++generationRef.current);
  }, [prsRef, selectedRef, summarize]);

  // ---- Chọn PR & chỉnh sửa tóm tắt ------------------------------------------------------

  const togglePr = useCallback((prNumber: number) => {
    setSelectedPrNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(prNumber)) next.delete(prNumber);
      else next.add(prNumber);
      return next;
    });
  }, []);

  const setAllSelected = useCallback(
    (isSelected: boolean) => {
      setSelectedPrNumbers(
        isSelected ? new Set((prsRef.current ?? []).map((pr) => pr.number)) : new Set(),
      );
    },
    [prsRef],
  );

  const updateBullets = useCallback(
    (bullets: string[]) => {
      summaryTask.setData((prev) => (prev ? { ...prev, bullets } : prev));
    },
    [summaryTask.setData],
  );

  // ---- Trạng thái dẫn xuất (không lưu state thừa) ---------------------------------------

  const prs = prsTask.data;
  const totalCommits = useMemo(
    () => (prs ?? []).reduce((sum, pr) => sum + pr.commits.length, 0),
    [prs],
  );

  const status: ReportStatus = useMemo(() => {
    if (notice) return notice;
    if (prsTask.isRunning) return { tone: 'busy', message: 'Đang quét PR & commits từ GitHub…' };
    if (summaryTask.isRunning) return { tone: 'busy', message: 'Đang tóm tắt bằng Local AI…' };
    if (prsTask.error) return { tone: 'error', message: `Lỗi GitHub CLI: ${prsTask.error}` };
    if (summaryTask.error) return { tone: 'error', message: `Lỗi tóm tắt: ${summaryTask.error}` };
    if (summaryTask.data && summaryTask.updatedAt) {
      return {
        tone: 'default',
        message: `✓ Đã tóm tắt (${summaryTask.data.provider}) • ${formatTime(summaryTask.updatedAt)}`,
      };
    }
    if (prs) {
      return prs.length > 0
        ? { tone: 'default', message: `Tìm thấy ${prs.length} PRs (${totalCommits} commits)` }
        : { tone: 'default', message: 'Không có PR hoặc commit nào trong khoảng thời gian này.' };
    }
    return { tone: 'default', message: 'Sẵn sàng' };
  }, [
    notice,
    prs,
    prsTask.error,
    prsTask.isRunning,
    summaryTask.data,
    summaryTask.error,
    summaryTask.isRunning,
    summaryTask.updatedAt,
    totalCommits,
  ]);

  return {
    prsTask,
    summaryTask,
    prs,
    totalCommits,
    selectedPrNumbers,
    isCopied: isCopied !== null,
    status,
    loadReport,
    regenerateSummary,
    copySummary,
    revealDestination,
    togglePr,
    setAllSelected,
    updateBullets,
  };
}

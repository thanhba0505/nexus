import { invoke } from '@tauri-apps/api/core';
import type { AISettings, AISummaryResult, PRReportItem, PrereqStatus } from '../types';

/**
 * Lớp gọi IPC duy nhất của GitHub Report.
 * Toàn bộ tên command & tham số Rust (camelCase ↔ snake_case) chỉ khai báo ở đây.
 * Mọi command phía Rust là `async fn` + `spawn_blocking` → không khoá UI.
 */
export const githubReportApi = {
  checkPrerequisites: () => invoke<PrereqStatus>('check_prerequisites'),

  fetchPrs: (sinceIso: string) => invoke<PRReportItem[]>('fetch_github_prs', { sinceIso }),

  generateSummary: (prs: PRReportItem[], ai: AISettings) =>
    invoke<AISummaryResult>('generate_ai_summary', {
      prs,
      promptTemplate: ai.promptTemplate || null,
      providerPreference: ai.provider || null,
    }),

  revealBrowserTab: (url: string, browserName: string) =>
    invoke<void>('reveal_browser_tab', { url, browserName }),

  saveGithubToken: (token: string) => invoke<void>('save_github_token', { token }),
};

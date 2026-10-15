import { LazyStore } from '@tauri-apps/plugin-store';
import { AppSettings } from '../types';

export const DEFAULT_PROMPT =
  "Below are the pull requests I worked on today, each with today's commit titles. " +
  'Write a summary for my daily standup in 3 to 4 lines total, covering all PRs together: ' +
  'group related work, describe outcomes in plain English, skip merges and trivial comment/doc tweaks. ' +
  "Each line is one short sentence, starting with '- ', no heading or preamble.";

export const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    provider: 'auto',
    promptTemplate: DEFAULT_PROMPT,
    customInstructions: 'Tập trung vào giá trị bàn giao, bỏ qua các commit merge và format',
    language: 'vi',
  },
  workflow: {
    destination: 'parabol',
    browser: 'Brave Browser',
    autoCopy: true,
    revealBrowser: false,
    parabolUrl: 'https://action.parabol.co',
  },
  filters: {
    excludedRepos: [],
    ignoredCommitPrefixes: ['chore(release)', 'style', 'docs'],
  },
};

const store = new LazyStore('settings.json');
const LOCAL_STORAGE_KEY = import.meta.env.DEV
  ? 'nexus_github_report_settings_dev'
  : 'nexus_github_report_settings';

export async function loadSettings(): Promise<AppSettings> {
  try {
    const saved = await store.get<AppSettings>('config');
    if (saved) {
      return {
        ...DEFAULT_SETTINGS,
        ...saved,
        ai: { ...DEFAULT_SETTINGS.ai, ...saved.ai },
        workflow: { ...DEFAULT_SETTINGS.workflow, ...saved.workflow },
        filters: { ...DEFAULT_SETTINGS.filters, ...saved.filters },
      };
    }
  } catch {
    // Fallback sang localStorage nếu ngoài môi trường Tauri
    try {
      const fallback = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (fallback) {
        return JSON.parse(fallback);
      }
    } catch {
      // Ignored
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await store.set('config', settings);
    await store.save();
  } catch {
    // Fallback sang localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignored
    }
  }
}

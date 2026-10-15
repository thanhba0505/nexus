export interface PrereqStatus {
  ghInstalled: boolean;
  ghLoggedIn: boolean;
  ghAccount?: string | undefined;
  claudeCliInstalled: boolean;
  antigravityCliInstalled: boolean;
  hasGithubToken: boolean;
}

export interface CommitItem {
  headline: string;
  committedDate: string;
}

export interface PRReportItem {
  number: u64Number;
  repository: string;
  title: string;
  url: string;
  state: 'OPEN' | 'MERGED' | 'CLOSED' | string;
  commits: CommitItem[];
}

export type u64Number = number;

export interface AISummaryResult {
  bullets: string[];
  rawSummary: string;
  provider: string;
}

export type DateMode = 'today' | 'last_workday';

export interface WorkflowSettings {
  destination: 'parabol' | 'slack' | 'copy_only';
  browser: 'Brave Browser' | 'Google Chrome' | 'Arc' | 'Safari';
  autoCopy: boolean;
  revealBrowser: boolean;
  parabolUrl: string;
}

export interface AISettings {
  provider: 'auto' | 'claude' | 'agy';
  promptTemplate: string;
  customInstructions: string;
  language: 'vi' | 'en';
}

export interface FilterSettings {
  excludedRepos: string[];
  ignoredCommitPrefixes: string[];
}

export interface AppSettings {
  ai: AISettings;
  workflow: WorkflowSettings;
  filters: FilterSettings;
}

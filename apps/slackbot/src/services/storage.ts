import { LazyStore } from '@tauri-apps/plugin-store';
import { DEFAULT_SLACK_SETTINGS, type SlackAppSettings } from '../types';

export { DEFAULT_SLACK_SETTINGS };

const store = new LazyStore('settings.json');
const LOCAL_STORAGE_KEY = import.meta.env.DEV
  ? 'nexus_slackbot_settings_dev'
  : 'nexus_slackbot_settings';

export async function loadSettings(): Promise<SlackAppSettings> {
  try {
    const saved = await store.get<SlackAppSettings>('config');
    if (saved) {
      return {
        ...DEFAULT_SLACK_SETTINGS,
        ...saved,
        identity: { ...DEFAULT_SLACK_SETTINGS.identity, ...saved.identity },
        slack: { ...DEFAULT_SLACK_SETTINGS.slack, ...saved.slack },
        ai: { ...DEFAULT_SLACK_SETTINGS.ai, ...saved.ai },
        persona: { ...DEFAULT_SLACK_SETTINGS.persona, ...saved.persona },
        conversations: saved.conversations ?? DEFAULT_SLACK_SETTINGS.conversations,
        loopPrevention: { ...DEFAULT_SLACK_SETTINGS.loopPrevention, ...saved.loopPrevention },
        draftInbox: { ...DEFAULT_SLACK_SETTINGS.draftInbox, ...saved.draftInbox },
        smartContext: { ...DEFAULT_SLACK_SETTINGS.smartContext, ...saved.smartContext },
        knowledgeBase: { ...DEFAULT_SLACK_SETTINGS.knowledgeBase, ...saved.knowledgeBase },
      };
    }
  } catch {
    // Fallback sang localStorage nếu ngoài môi trường Tauri hoặc đang tải web dev
    try {
      const fallback = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (fallback) {
        const parsed = JSON.parse(fallback);
        return {
          ...DEFAULT_SLACK_SETTINGS,
          ...parsed,
          identity: { ...DEFAULT_SLACK_SETTINGS.identity, ...parsed.identity },
          slack: { ...DEFAULT_SLACK_SETTINGS.slack, ...parsed.slack },
          ai: { ...DEFAULT_SLACK_SETTINGS.ai, ...parsed.ai },
          persona: { ...DEFAULT_SLACK_SETTINGS.persona, ...parsed.persona },
          conversations: parsed.conversations ?? DEFAULT_SLACK_SETTINGS.conversations,
          loopPrevention: { ...DEFAULT_SLACK_SETTINGS.loopPrevention, ...parsed.loopPrevention },
          draftInbox: { ...DEFAULT_SLACK_SETTINGS.draftInbox, ...parsed.draftInbox },
          smartContext: { ...DEFAULT_SLACK_SETTINGS.smartContext, ...parsed.smartContext },
          knowledgeBase: { ...DEFAULT_SLACK_SETTINGS.knowledgeBase, ...parsed.knowledgeBase },
        };
      }
    } catch {
      // Ignored
    }
  }
  return DEFAULT_SLACK_SETTINGS;
}

export async function saveSettings(settings: SlackAppSettings): Promise<void> {
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

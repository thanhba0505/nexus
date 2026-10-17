import { useCallback, useState } from 'react';
import { useLatestRef } from '@nexus/ui';
import { DEFAULT_SLACK_SETTINGS, loadSettings, saveSettings } from '../services/storage';
import type { SlackAppSettings } from '../types';

/**
 * Nguồn sự thật duy nhất cho cấu hình SlackBot.
 * - `settings`: dùng cho React render.
 * - `settingsRef`: dùng trong các async callbacks và listeners (luôn mới nhất, không gây re-run effect).
 */
export function useSlackSettings() {
  const [settings, setSettings] = useState<SlackAppSettings>(DEFAULT_SLACK_SETTINGS);
  const settingsRef = useLatestRef(settings);

  const load = useCallback(async () => {
    const loaded = await loadSettings();
    settingsRef.current = loaded;
    setSettings(loaded);
    return loaded;
  }, [settingsRef]);

  const save = useCallback(
    async (next: SlackAppSettings) => {
      settingsRef.current = next;
      setSettings(next);
      await saveSettings(next);
    },
    [settingsRef],
  );

  return { settings, settingsRef, load, save };
}

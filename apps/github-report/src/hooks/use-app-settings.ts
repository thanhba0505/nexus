import { useCallback, useState } from 'react';
import { useLatestRef } from '@nexus/ui';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../services/storage';
import type { AppSettings } from '../types';

/**
 * Nguồn sự thật duy nhất cho cấu hình người dùng.
 * - `settings`: dùng để render.
 * - `settingsRef`: dùng trong callback bất đồng bộ (luôn mới nhất, không gây re-run effect).
 */
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const settingsRef = useLatestRef(settings);

  const load = useCallback(async () => {
    const loaded = await loadSettings();
    // Gán ref ngay để `onReady` của bootstrap đọc được cấu hình thật, không phải mặc định.
    settingsRef.current = loaded;
    setSettings(loaded);
    return loaded;
  }, [settingsRef]);

  const save = useCallback(
    async (next: AppSettings) => {
      settingsRef.current = next;
      setSettings(next);
      await saveSettings(next);
    },
    [settingsRef],
  );

  return { settings, settingsRef, load, save };
}

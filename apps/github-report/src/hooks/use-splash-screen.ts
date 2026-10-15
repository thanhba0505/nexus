import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { loadSettings, DEFAULT_SETTINGS } from '../services/storage';
import { AppSettings, PrereqStatus } from '../types';

export function useSplashScreen() {
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [isExitingSplash, setIsExitingSplash] = useState<boolean>(false);
  const [initProgress, setInitProgress] = useState<number>(15);
  const [initMessage, setInitMessage] = useState<string>('Nạp cấu hình hệ thống...');

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [prereqStatus, setPrereqStatus] = useState<PrereqStatus | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const runStartupSequence = async () => {
      try {
        setInitMessage('Nạp cấu hình settings.json...');
        setInitProgress(30);

        const loaded = await loadSettings();
        if (!isMountedRef.current) return;
        setSettings(loaded);
        setInitProgress(65);

        setInitMessage('Kiểm tra GitHub CLI & môi trường AI...');
        const prereq = await invoke<PrereqStatus>('check_prerequisites');
        if (!isMountedRef.current) return;
        setPrereqStatus(prereq);
        setInitProgress(100);
        setInitMessage('Sẵn sàng!');

        // Đợi 200ms để người dùng thấy progress 100%
        await new Promise((r) => setTimeout(r, 200));
        if (!isMountedRef.current) return;
        setIsExitingSplash(true);

        // Đợi 300ms hiệu ứng fade-out của splash screen
        await new Promise((r) => setTimeout(r, 300));
        if (!isMountedRef.current) return;
        setIsAppReady(true);
      } catch (err) {
        console.warn('Lỗi khởi tạo hệ thống:', err);
        if (!isMountedRef.current) return;
        setIsExitingSplash(true);
        setTimeout(() => setIsAppReady(true), 300);
      }
    };

    runStartupSequence();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isAppReady,
    isExitingSplash,
    initProgress,
    initMessage,
    settings,
    setSettings,
    prereqStatus,
    setPrereqStatus,
  };
}

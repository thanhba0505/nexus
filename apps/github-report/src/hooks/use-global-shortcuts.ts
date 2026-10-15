import { useEffect } from 'react';

export interface UseGlobalShortcutsOptions {
  onFetch: () => void;
  onSummarize: () => void;
  onCopy: () => void;
  onRevealDestination: () => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
}

export function useGlobalShortcuts({
  onFetch,
  onSummarize,
  onCopy,
  onRevealDestination,
  onToggleSettings,
  isSettingsOpen,
  onCloseSettings,
}: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'r') {
          e.preventDefault();
          onFetch();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          onSummarize();
        } else if (e.key === 'c' && !window.getSelection()?.toString()) {
          e.preventDefault();
          onCopy();
        } else if (e.key === 'p') {
          e.preventDefault();
          onRevealDestination();
        } else if (e.key === ',') {
          e.preventDefault();
          onToggleSettings();
        }
      } else if (e.key === 'Escape' && isSettingsOpen) {
        onCloseSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onFetch,
    onSummarize,
    onCopy,
    onRevealDestination,
    onToggleSettings,
    isSettingsOpen,
    onCloseSettings,
  ]);
}

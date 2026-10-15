import { useEffect } from 'react';
import { useLatestRef } from './use-latest-ref';

/**
 * Handler phím tắt. Trả về `false` để KHÔNG chặn hành vi mặc định
 * (ví dụ `mod+c` khi người dùng đang bôi đen văn bản).
 */
export type HotkeyHandler = (event: KeyboardEvent) => boolean | void;

/**
 * Map tổ hợp phím → handler. Cú pháp: `mod+shift+alt+<key>`, không phân biệt hoa thường.
 * - `mod` = ⌘ trên macOS, Ctrl trên hệ điều hành khác.
 * - `<key>` là `KeyboardEvent.key` viết thường: `r`, `enter`, `escape`, `,`…
 * - Giá trị `undefined`/`false` = tạm tắt phím đó.
 */
export type HotkeyMap = Record<string, HotkeyHandler | undefined | false>;

export interface UseHotkeysOptions {
  /** Tắt toàn bộ phím tắt (ví dụ khi splash còn hiển thị). Mặc định `true`. */
  enabled?: boolean;
  /** Các tổ hợp vẫn hoạt động khi focus trong input/textarea. Mặc định `['escape']`. */
  enableInInputs?: string[];
}

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

function normalizeCombo(combo: string): string {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop() ?? '';
  const modifiers = ['mod', 'shift', 'alt'].filter((m) => parts.includes(m));
  return [...modifiers, key].join('+');
}

function comboFromEvent(event: KeyboardEvent): string {
  const isMod = IS_MAC ? event.metaKey : event.ctrlKey;
  const modifiers = [isMod && 'mod', event.shiftKey && 'shift', event.altKey && 'alt'].filter(
    Boolean,
  );
  return [...modifiers, event.key.toLowerCase()].join('+');
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

/**
 * Đăng ký phím tắt toàn cục với MỘT listener duy nhất trong suốt vòng đời component.
 * Handler luôn đọc giá trị mới nhất qua ref nên có thể truyền inline mà không gây re-subscribe.
 *
 * @example
 * useHotkeys({
 *   'mod+r': () => refresh(),
 *   'mod+,': () => setSettingsOpen((v) => !v),
 *   escape: isOpen ? () => close() : undefined,
 * }, { enabled: boot.isReady, enableInInputs: ['escape', 'mod+r'] });
 */
export function useHotkeys(hotkeys: HotkeyMap, options: UseHotkeysOptions = {}) {
  const hotkeysRef = useLatestRef(hotkeys);
  const optionsRef = useLatestRef(options);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { enabled = true, enableInInputs = ['escape'] } = optionsRef.current;
      if (!enabled || event.isComposing) return;

      const combo = comboFromEvent(event);
      const entry = Object.entries(hotkeysRef.current).find(
        ([key]) => normalizeCombo(key) === combo,
      );
      const handler = entry?.[1];
      if (!entry || !handler) return;

      if (
        isEditableTarget(event.target) &&
        !enableInInputs.some((allowed) => normalizeCombo(allowed) === combo)
      ) {
        return;
      }

      if (handler(event) !== false) event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeysRef, optionsRef]);
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Giá trị tự biến mất sau `durationMs` — dùng cho thông báo ngắn ("✓ Đã sao chép"),
 * trạng thái nút tạm thời… Tự dọn timer khi unmount hoặc khi hiển thị giá trị mới.
 *
 * @example
 * const [notice, showNotice] = useTransientValue<string>(2500);
 * showNotice('✓ Đã sao chép');
 */
export function useTransientValue<T>(
  durationMs = 2000,
): [value: T | null, show: (value: T) => void, clear: () => void] {
  const [value, setValue] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setValue(null);
  }, []);

  const show = useCallback(
    (next: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setValue(next);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setValue(null);
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return [value, show, clear];
}

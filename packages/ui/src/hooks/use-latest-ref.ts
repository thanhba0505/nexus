import { useLayoutEffect, useRef } from 'react';

/**
 * Giữ giá trị mới nhất trong một ref ổn định (identity không đổi giữa các lần render).
 *
 * Dùng khi callback/effect cần đọc giá trị mới nhất (settings, props, handler)
 * mà KHÔNG muốn đưa giá trị đó vào dependency array — tránh effect chạy lại
 * và tránh vòng lặp gọi API.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

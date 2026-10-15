import { useCallback, useRef, useState } from 'react';
import { useLatestRef } from './use-latest-ref';

export type AsyncTaskStatus = 'idle' | 'running' | 'success' | 'error';

export interface AsyncTaskState<TData> {
  /** Dữ liệu thành công gần nhất. Được GIỮ LẠI khi chạy lại (stale-while-revalidate). */
  data: TData | undefined;
  /** Thông điệp lỗi của lần chạy gần nhất (null nếu không lỗi). */
  error: string | null;
  status: AsyncTaskStatus;
  /** Thời điểm (ms) có dữ liệu thành công gần nhất. */
  updatedAt: number | null;
}

export interface UseAsyncTaskOptions<TArgs extends unknown[], TData> {
  /** Gọi sau khi task thành công VÀ kết quả vẫn là mới nhất (không bị thay thế). */
  onSuccess?: (data: TData, args: TArgs) => void;
  /** Gọi khi task lỗi VÀ lần chạy vẫn là mới nhất. */
  onError?: (error: string, args: TArgs) => void;
  /**
   * Khoá chống gọi trùng. Nếu một lần chạy với cùng khoá đang diễn ra,
   * `run()` trả lại đúng promise đó thay vì gọi API lần nữa.
   * Mặc định: `JSON.stringify(args)`.
   */
  getKey?: (...args: TArgs) => string;
}

export interface AsyncTask<TArgs extends unknown[], TData> extends AsyncTaskState<TData> {
  isRunning: boolean;
  hasData: boolean;
  /** Đang chạy và CHƯA có dữ liệu → hiển thị skeleton. */
  isInitialLoading: boolean;
  /** Đang chạy và ĐÃ có dữ liệu cũ → giữ nội dung, chỉ hiện thanh tiến trình mảnh. */
  isRefreshing: boolean;
  /**
   * Chạy task. Identity ổn định suốt vòng đời component.
   * Trả về `undefined` nếu lỗi hoặc kết quả đã bị một lần chạy mới hơn thay thế.
   */
  run: (...args: TArgs) => Promise<TData | undefined>;
  /** Bỏ qua kết quả của lần chạy đang diễn ra (giữ nguyên data cũ). */
  cancel: () => void;
  /** Cập nhật data thủ công (ví dụ người dùng chỉnh sửa nội dung). */
  setData: (updater: (prev: TData | undefined) => TData | undefined) => void;
  /** Huỷ lần chạy hiện tại và xoá toàn bộ state về ban đầu. */
  reset: () => void;
}

const INITIAL_STATE = {
  data: undefined,
  error: null,
  status: 'idle',
  updatedAt: null,
} as const satisfies AsyncTaskState<never>;

export function toErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function defaultKey(...args: unknown[]): string {
  try {
    return JSON.stringify(args);
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

/**
 * Quản lý một tác vụ bất đồng bộ (IPC/HTTP) theo chuẩn Nexus:
 *
 * - **Latest-wins**: kết quả của lần chạy cũ bị bỏ qua nếu đã có lần chạy mới hơn.
 * - **Dedupe**: gọi `run()` trùng khoá khi đang chạy → dùng lại promise, không gọi API thêm.
 * - **Stale-while-revalidate**: dữ liệu hiện có được duy trì trong lúc nạp lại (giữ giao diện ổn định).
 * - **`run` ổn định**: an toàn khi dùng trong event handler, không cần đưa vào deps.
 *
 * @example
 * const prsTask = useAsyncTask((sinceIso: string) => api.fetchPrs(sinceIso));
 * const items = await prsTask.run(sinceIso); // undefined nếu lỗi/bị thay thế
 */
export function useAsyncTask<TArgs extends unknown[], TData>(
  task: (...args: TArgs) => Promise<TData>,
  options: UseAsyncTaskOptions<TArgs, TData> = {},
): AsyncTask<TArgs, TData> {
  const [state, setState] = useState<AsyncTaskState<TData>>(INITIAL_STATE);
  const taskRef = useLatestRef(task);
  const optionsRef = useLatestRef(options);
  const requestIdRef = useRef(0);
  const inFlightRef = useRef<{
    id: number;
    key: string;
    promise: Promise<TData | undefined>;
  } | null>(null);

  const run = useCallback(
    (...args: TArgs): Promise<TData | undefined> => {
      const key = (optionsRef.current.getKey ?? defaultKey)(...args);
      const inFlight = inFlightRef.current;
      if (inFlight && inFlight.key === key && inFlight.id === requestIdRef.current) {
        return inFlight.promise;
      }

      const id = ++requestIdRef.current;
      setState((prev) => ({ ...prev, status: 'running', error: null }));

      // Promise.resolve().then(...) đảm bảo inFlightRef được gán TRƯỚC khi task chạy.
      const promise = Promise.resolve()
        .then(() => taskRef.current(...args))
        .then(
          (data) => {
            if (id !== requestIdRef.current) return undefined;
            setState({ data, error: null, status: 'success', updatedAt: Date.now() });
            optionsRef.current.onSuccess?.(data, args);
            return data;
          },
          (err: unknown) => {
            if (id !== requestIdRef.current) return undefined;
            const message = toErrorMessage(err);
            setState((prev) => ({ ...prev, status: 'error', error: message }));
            optionsRef.current.onError?.(message, args);
            return undefined;
          },
        )
        .finally(() => {
          if (inFlightRef.current?.id === id) inFlightRef.current = null;
        });

      inFlightRef.current = { id, key, promise };
      return promise;
    },
    [optionsRef, taskRef],
  );

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    inFlightRef.current = null;
    setState((prev) =>
      prev.status === 'running'
        ? { ...prev, status: prev.data !== undefined ? 'success' : 'idle' }
        : prev,
    );
  }, []);

  const setData = useCallback((updater: (prev: TData | undefined) => TData | undefined) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    inFlightRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const isRunning = state.status === 'running';
  const hasData = state.data !== undefined;

  return {
    ...state,
    isRunning,
    hasData,
    isInitialLoading: isRunning && !hasData,
    isRefreshing: isRunning && hasData,
    run,
    cancel,
    setData,
    reset,
  };
}

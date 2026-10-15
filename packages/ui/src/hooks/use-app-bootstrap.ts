import { useEffect, useRef, useState } from 'react';
import { toErrorMessage } from './use-async-task';
import { useLatestRef } from './use-latest-ref';

export interface BootstrapStep {
  /** Thông điệp hiển thị trên splash khi bước này đang chạy. */
  label: string;
  /** Công việc khởi động NHẸ (đọc settings, kiểm tra môi trường). Không fetch dữ liệu nặng ở đây. */
  run: () => Promise<void> | void;
}

export type BootstrapPhase = 'booting' | 'exiting' | 'ready';

export interface UseAppBootstrapOptions {
  steps: BootstrapStep[];
  /**
   * Gọi đúng MỘT lần khi mọi bước hoàn tất, ngay lúc splash bắt đầu fade-out.
   * Đây là nơi kích hoạt tải dữ liệu chính (event-driven, không cần useEffect theo dõi `isReady`).
   */
  onReady?: () => void;
  /** Gọi khi một bước lỗi. Bootstrap vẫn tiếp tục để app luôn mở được. */
  onStepError?: (error: string, step: BootstrapStep) => void;
  /** Thời gian giữ progress 100% trước khi fade-out (ms). Mặc định 150. */
  holdMs?: number;
  /** Thời lượng fade-out của splash (ms) — khớp với `AppSplashScreen`. Mặc định 300. */
  exitMs?: number;
}

export interface AppBootstrapState {
  phase: BootstrapPhase;
  progress: number;
  message: string;
  /** Splash đã biến mất hoàn toàn. */
  isReady: boolean;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Chạy chuỗi khởi động của mini app đúng MỘT lần (kể cả dưới React StrictMode),
 * cập nhật progress cho `AppSplashScreen`, rồi gọi `onReady`.
 *
 * @example
 * const boot = useAppBootstrap({
 *   steps: [
 *     { label: 'Nạp cấu hình…', run: loadSettings },
 *     { label: 'Kiểm tra môi trường…', run: checkEnv },
 *   ],
 *   onReady: () => void loadData(),
 * });
 */
export function useAppBootstrap(options: UseAppBootstrapOptions): AppBootstrapState {
  const optionsRef = useLatestRef(options);
  const hasStartedRef = useRef(false);
  const [state, setState] = useState<Omit<AppBootstrapState, 'isReady'>>({
    phase: 'booting',
    progress: 5,
    message: options.steps[0]?.label ?? 'Đang khởi động…',
  });

  useEffect(() => {
    // StrictMode mount → unmount → mount lại: ref vẫn giữ nguyên nên chỉ chạy 1 lần.
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const runSequence = async () => {
      const { steps, holdMs = 150, exitMs = 300 } = optionsRef.current;
      const total = Math.max(steps.length, 1);

      for (const [index, step] of steps.entries()) {
        setState((prev) => ({ ...prev, message: step.label }));
        try {
          await step.run();
        } catch (err) {
          console.warn(`[bootstrap] "${step.label}" lỗi:`, err);
          optionsRef.current.onStepError?.(toErrorMessage(err), step);
        }
        setState((prev) => ({ ...prev, progress: Math.round(((index + 1) / total) * 100) }));
      }

      setState({ phase: 'booting', progress: 100, message: 'Sẵn sàng' });
      await sleep(holdMs);
      setState((prev) => ({ ...prev, phase: 'exiting' }));
      optionsRef.current.onReady?.();
      await sleep(exitMs);
      setState((prev) => ({ ...prev, phase: 'ready' }));
    };

    void runSequence();
  }, [optionsRef]);

  return { ...state, isReady: state.phase === 'ready' };
}

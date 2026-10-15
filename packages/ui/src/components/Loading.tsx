import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps {
  className?: string;
}

/** Khối placeholder nhấp nháy nhẹ cho trạng thái tải LẦN ĐẦU (chưa có dữ liệu). */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={twMerge(clsx('animate-pulse rounded-md bg-white/10', className))} />;
}

export interface LoadingBarProps {
  className?: string;
}

/**
 * Thanh tiến trình mảnh (indeterminate) cho trạng thái LÀM MỚI khi đã có dữ liệu cũ.
 * Không chiếm thêm chiều cao layout khi đặt `absolute` → không gây giật bố cục.
 */
export function LoadingBar({ className }: LoadingBarProps) {
  return (
    <div
      role="progressbar"
      aria-busy="true"
      className={twMerge(
        clsx('h-0.5 w-full overflow-hidden rounded-full bg-sky-500/10', className),
      )}
    >
      <div className="h-full w-1/3 rounded-full bg-sky-400 animate-indeterminate" />
    </div>
  );
}

export interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        clsx(
          'inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-[1.5px] border-sky-400 border-t-transparent',
          className,
        ),
      )}
    />
  );
}

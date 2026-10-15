import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LoadingBar } from './Loading';

export interface AsyncContentProps {
  /** Tác vụ đang chạy (lần đầu hoặc làm mới). */
  isLoading: boolean;
  /** Đã có dữ liệu để hiển thị (kể cả dữ liệu cũ). */
  hasData: boolean;
  /** Lỗi của lần chạy gần nhất. */
  error?: string | null | undefined;
  /** Hiển thị khi tải lần đầu (chưa có dữ liệu). */
  skeleton: React.ReactNode;
  /** Hiển thị khi đã tải xong nhưng không có dữ liệu. */
  empty?: React.ReactNode;
  /** Tuỳ biến giao diện lỗi khi chưa có dữ liệu. */
  renderError?: (error: string) => React.ReactNode;
  /** Nội dung chính, chỉ render khi `hasData`. */
  children: React.ReactNode;
  className?: string;
}

function DefaultError({ error }: { error: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[11px] text-rose-200">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
      <p className="whitespace-pre-wrap break-words leading-relaxed">{error}</p>
    </div>
  );
}

/**
 * Bộ chọn trạng thái hiển thị chuẩn cho mọi khu vực tải dữ liệu bất đồng bộ.
 *
 * | Trạng thái                    | Hiển thị                                        |
 * | :---------------------------- | :---------------------------------------------- |
 * | Chưa có data + đang tải       | `skeleton`                                      |
 * | Chưa có data + lỗi            | `renderError` / khung lỗi mặc định              |
 * | Chưa có data + xong           | `empty`                                         |
 * | Có data (+ đang làm mới)      | `children` (mờ nhẹ) + `LoadingBar` mảnh ở trên  |
 * | Có data + lỗi làm mới         | `children` + dải lỗi nhỏ phía trên              |
 *
 * Nội dung hiện có được duy trì liên tục khi làm mới, đảm bảo tính ổn định của layout.
 */
export function AsyncContent({
  isLoading,
  hasData,
  error,
  skeleton,
  empty = null,
  renderError,
  children,
  className,
}: AsyncContentProps) {
  if (!hasData) {
    const body = isLoading
      ? skeleton
      : error
        ? (renderError?.(error) ?? <DefaultError error={error} />)
        : empty;
    return <div className={className}>{body}</div>;
  }

  return (
    <div className={twMerge(clsx('relative', className))}>
      {isLoading && <LoadingBar className="absolute inset-x-0 top-0 z-10" />}
      {!isLoading && error && (
        <div className="mb-2">
          <DefaultError error={error} />
        </div>
      )}
      <div
        aria-busy={isLoading}
        className={clsx('transition-opacity duration-200', isLoading && 'opacity-60')}
      >
        {children}
      </div>
    </div>
  );
}

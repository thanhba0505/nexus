import { useState } from 'react';
import { Sparkles, Edit3, Check, Copy, Bot } from 'lucide-react';
import { AsyncContent, Skeleton, Spinner } from '@nexus/ui';
import { parseSummaryText } from '../lib/report-utils';
import type { AISummaryResult } from '../types';

export interface AISummaryCardProps {
  summary: AISummaryResult | undefined;
  /** Đang tóm tắt, hoặc đang chờ dữ liệu PR để tóm tắt. */
  isLoading: boolean;
  loadingLabel: string;
  error: string | null;
  /** Có PR để tóm tắt hay không. */
  canGenerate: boolean;
  isCopied: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onUpdateBullets: (bullets: string[]) => void;
}

const ACTION_BUTTON =
  'flex h-6.5 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-30';

function SummarySkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-2 py-1">
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <p className="flex items-center gap-1.5 pt-1 text-[11px] text-white/40">
        <Spinner className="h-2.5 w-2.5" />
        {label}
      </p>
    </div>
  );
}

export function AISummaryCard({
  summary,
  isLoading,
  loadingLabel,
  error,
  canGenerate,
  isCopied,
  onGenerate,
  onCopy,
  onUpdateBullets,
}: AISummaryCardProps) {
  const [editText, setEditText] = useState<string | null>(null);
  const isEditing = editText !== null;
  const bullets = summary?.bullets ?? [];
  const hasSummary = bullets.length > 0;

  const startEdit = () => setEditText(bullets.map((b) => `• ${b}`).join('\n'));
  const cancelEdit = () => setEditText(null);
  const saveEdit = () => {
    if (editText !== null) onUpdateBullets(parseSummaryText(editText));
    setEditText(null);
  };

  return (
    <section className="flex w-full shrink-0 flex-col gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-md">
      {/* Header: luôn giữ nguyên bố cục, nút chỉ disable chứ không ẩn → không nhảy layout */}
      <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <h3 className="text-xs font-semibold text-white/90">AI Daily Standup</h3>
          {summary?.provider && (
            <span className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/60">
              <Bot className="h-2.5 w-2.5 text-sky-400/80" />
              {summary.provider}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onGenerate}
            disabled={isLoading || !canGenerate || isEditing}
            className={`${ACTION_BUTTON} border border-white/[0.06] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white`}
            title="Tóm tắt lại bằng AI (⌘↵)"
          >
            <Sparkles className="h-3 w-3 text-sky-400" />
            <span>{hasSummary ? 'Tóm tắt lại' : 'Tóm tắt'}</span>
          </button>
          <button
            onClick={isEditing ? saveEdit : startEdit}
            disabled={isLoading || !hasSummary}
            className={`${ACTION_BUTTON} border border-white/[0.06] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white`}
            title="Chỉnh sửa nhanh trước khi gửi"
          >
            {isEditing ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="font-semibold text-emerald-300">Lưu</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3 w-3" />
                <span>Sửa</span>
              </>
            )}
          </button>
          <button
            onClick={onCopy}
            disabled={!hasSummary}
            className={`${ACTION_BUTTON} border border-sky-500/25 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 hover:text-sky-200`}
            title="Sao chép (⌘C)"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="font-semibold text-emerald-300">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Chép</span>
              </>
            )}
          </button>
        </div>
      </header>

      <AsyncContent
        className="min-h-[64px]"
        isLoading={isLoading}
        hasData={hasSummary}
        error={error}
        skeleton={<SummarySkeleton label={loadingLabel} />}
        empty={
          <div className="flex min-h-[64px] flex-col items-center justify-center gap-2 py-1 text-center">
            <p className="text-xs text-white/50">
              {canGenerate
                ? 'Dữ liệu PR đã sẵn sàng. Bấm để tạo bản tóm tắt Daily Standup.'
                : 'Không có PR hoặc commit nào trong khoảng thời gian đã chọn.'}
            </p>
            {canGenerate && (
              <button
                onClick={onGenerate}
                className="flex h-7 items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/20 px-3 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-500/30 hover:text-white active:scale-95"
              >
                <Sparkles className="h-3 w-3 text-sky-400" />
                <span>Tạo tóm tắt Daily Standup</span>
                <kbd className="ml-1 rounded bg-black/40 px-1 py-0.5 font-mono text-[9px] text-white/70">
                  ⌘↵
                </kbd>
              </button>
            )}
          </div>
        }
      >
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter' && e.metaKey) saveEdit();
              }}
              rows={4}
              className="w-full resize-none rounded-lg border border-white/[0.12] bg-black/40 p-2.5 font-sans text-xs leading-relaxed text-white/90 placeholder-white/40 focus:border-sky-400/80 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
              placeholder="Mỗi dòng là một gạch đầu dòng…"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={cancelEdit}
                className="h-6.5 rounded-md px-2.5 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white"
              >
                Huỷ (Esc)
              </button>
              <button
                onClick={saveEdit}
                className="h-6.5 rounded-md bg-sky-500 px-3 text-[11px] font-medium text-white shadow-xs hover:bg-sky-400"
              >
                Cập nhật (⌘↵)
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5 text-xs leading-relaxed text-white/85">
            {bullets.map((line, index) => (
              <li key={`${index}-${line}`} className="flex items-start gap-2">
                <span className="select-none font-medium text-sky-400/80">•</span>
                <p className="flex-1 select-text leading-relaxed">{line}</p>
              </li>
            ))}
          </ul>
        )}
      </AsyncContent>
    </section>
  );
}

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
  'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

function SummarySkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-2.5 py-1">
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <p className="flex items-center gap-1.5 pt-1 text-[11px] text-white/45">
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
    <section className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/10 to-transparent p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
      {/* Header: luôn giữ nguyên bố cục, nút chỉ disable chứ không ẩn → không nhảy layout */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/20 text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
            AI Daily Standup
          </h3>
          {summary?.provider && (
            <span className="flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
              <Bot className="h-2.5 w-2.5" />
              {summary.provider}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={onGenerate}
            disabled={isLoading || !canGenerate || isEditing}
            className={`${ACTION_BUTTON} bg-white/5 text-white/70 hover:bg-white/10 hover:text-white`}
            title="Tóm tắt lại bằng AI (⌘↵)"
          >
            <Sparkles className="h-3 w-3 text-sky-400" />
            {hasSummary ? 'Tóm tắt lại' : 'Tóm tắt'}
          </button>
          <button
            onClick={isEditing ? saveEdit : startEdit}
            disabled={isLoading || !hasSummary}
            className={`${ACTION_BUTTON} bg-white/5 text-white/70 hover:bg-white/10 hover:text-white`}
            title="Chỉnh sửa nhanh trước khi gửi"
          >
            {isEditing ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Lưu</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3 w-3" />
                Sửa
              </>
            )}
          </button>
          <button
            onClick={onCopy}
            disabled={!hasSummary}
            className={`${ACTION_BUTTON} border border-sky-500/30 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 hover:text-white`}
            title="Sao chép (⌘C)"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Chép
              </>
            )}
          </button>
        </div>
      </header>

      <AsyncContent
        className="min-h-[76px]"
        isLoading={isLoading}
        hasData={hasSummary}
        error={error}
        skeleton={<SummarySkeleton label={loadingLabel} />}
        empty={
          <div className="flex min-h-[76px] flex-col items-center justify-center gap-2.5 text-center">
            <p className="text-xs text-white/50">
              {canGenerate
                ? 'Dữ liệu PR đã sẵn sàng. Bấm để tạo bản tóm tắt Daily Standup.'
                : 'Không có PR hoặc commit nào để tóm tắt.'}
            </p>
            {canGenerate && (
              <button
                onClick={onGenerate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-indigo-500 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Tạo tóm tắt Daily Standup
                <kbd className="ml-1 rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
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
              className="w-full resize-none rounded-xl border border-white/20 bg-black/40 px-3 py-2 font-sans text-xs leading-relaxed text-white placeholder-white/40 focus:border-sky-400 focus:outline-none"
              placeholder="Mỗi dòng là một gạch đầu dòng…"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="rounded-md px-2.5 py-1 text-[11px] text-white/50 hover:text-white"
              >
                Huỷ (Esc)
              </button>
              <button
                onClick={saveEdit}
                className="rounded-md bg-sky-500 px-3 py-1 text-[11px] font-medium text-white shadow-sm"
              >
                Cập nhật (⌘↵)
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5 text-xs leading-relaxed text-white/90">
            {bullets.map((line, index) => (
              <li key={`${index}-${line}`} className="flex items-start gap-2">
                <span className="select-none font-bold text-sky-400">•</span>
                <p className="flex-1 select-text">{line}</p>
              </li>
            ))}
          </ul>
        )}
      </AsyncContent>
    </section>
  );
}

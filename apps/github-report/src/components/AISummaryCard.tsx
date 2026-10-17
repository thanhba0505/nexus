import { useState } from 'react';
import { Sparkles, Edit3, Check, Copy, Bot, Calendar } from 'lucide-react';
import { AsyncContent, Skeleton, Spinner, ContentCard, AppButton, AppTabs } from '@nexus/ui';
import { parseSummaryText } from '../lib/report-utils';
import type { AISummaryResult, DateMode } from '../types';

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
  dateMode?: DateMode;
  onDateModeChange?: (mode: DateMode) => void;
}

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
  dateMode,
  onDateModeChange,
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
    <ContentCard
      title="AI Daily Standup"
      icon={Sparkles}
      badge={
        summary?.provider && (
          <span className="flex items-center gap-1 rounded-md border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-300">
            <Bot className="h-2.5 w-2.5 text-sky-400/80" />
            {summary.provider}
          </span>
        )
      }
      actions={
        <div className="flex shrink-0 items-center gap-2">
          {dateMode && onDateModeChange && (
            <AppTabs
              items={[
                { id: 'today', label: 'Hôm nay', icon: Calendar },
                { id: 'last_workday', label: 'Ngày trước' },
              ]}
              activeId={dateMode}
              onChange={(id) => !isLoading && onDateModeChange(id as DateMode)}
              variant="segmented"
              size="sm"
            />
          )}

          <div className="flex items-center gap-1.5">
            <AppButton
              size="sm"
              variant="glass"
              onClick={onGenerate}
              disabled={isLoading || !canGenerate || isEditing}
              icon={Sparkles}
              title="Tóm tắt lại bằng AI (⌘↵)"
            >
              <span>{hasSummary ? 'Tóm tắt lại' : 'Tóm tắt'}</span>
            </AppButton>

            <AppButton
              size="sm"
              variant="glass"
              onClick={isEditing ? saveEdit : startEdit}
              disabled={isLoading || !hasSummary}
              icon={isEditing ? Check : Edit3}
              title="Chỉnh sửa nhanh trước khi gửi"
            >
              <span>{isEditing ? 'Lưu' : 'Sửa'}</span>
            </AppButton>

            <AppButton
              size="sm"
              variant={isCopied ? 'secondary' : 'glass'}
              onClick={onCopy}
              disabled={isLoading || !hasSummary}
              icon={isCopied ? Check : Copy}
              title="Sao chép (⌘C)"
            >
              <span>{isCopied ? 'Đã chép' : 'Chép'}</span>
            </AppButton>
          </div>
        </div>
      }
      variant="acrylic"
      padding="md"
    >
      <AsyncContent
        className="min-h-[64px]"
        isLoading={isLoading}
        hasData={hasSummary}
        error={error}
        skeleton={<SummarySkeleton label={loadingLabel} />}
        empty={
          <div className="flex min-h-[140px] flex-col items-center justify-center gap-2.5 py-7 text-center">
            <p className="text-xs text-white/50">
              {canGenerate
                ? 'Dữ liệu PR đã sẵn sàng. Bấm để tạo bản tóm tắt Daily Standup.'
                : 'Không có PR hoặc commit nào trong khoảng thời gian đã chọn.'}
            </p>
            {canGenerate && (
              <AppButton
                variant="primary"
                size="md"
                onClick={onGenerate}
                disabled={isLoading}
                icon={Sparkles}
                hotkey="⌘↵"
              >
                Tạo tóm tắt Daily Standup
              </AppButton>
            )}
          </div>
        }
      >
        {isEditing ? (
          <div className="flex flex-col gap-2.5">
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter' && e.metaKey) saveEdit();
              }}
              rows={4}
              className="w-full resize-none rounded-xl border border-sky-500/30 bg-black/40 p-3 font-sans text-xs leading-relaxed text-white/90 placeholder-white/40 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
              placeholder="Mỗi dòng là một gạch đầu dòng…"
            />
            <div className="flex justify-end gap-2">
              <AppButton variant="ghost" size="sm" onClick={cancelEdit}>
                Huỷ (Esc)
              </AppButton>
              <AppButton variant="primary" size="sm" onClick={saveEdit}>
                Cập nhật (⌘↵)
              </AppButton>
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
    </ContentCard>
  );
}

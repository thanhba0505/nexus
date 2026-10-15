import { useState, useEffect } from 'react';
import { Sparkles, Edit3, Check, Copy, Bot } from 'lucide-react';

export interface AISummaryCardProps {
  bullets: string[];
  provider: string;
  isLoading: boolean;
  onUpdateBullets: (newBullets: string[]) => void;
  onCopy: () => void;
  isCopied: boolean;
  hasPrs?: boolean;
  onGenerateSummary?: () => void;
}

export function AISummaryCard({
  bullets,
  provider,
  isLoading,
  onUpdateBullets,
  onCopy,
  isCopied,
  hasPrs = false,
  onGenerateSummary,
}: AISummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setEditText(bullets.map((b) => `• ${b}`).join('\n'));
  }, [bullets]);

  const handleSaveEdit = () => {
    const updated = editText
      .split('\n')
      .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
      .filter((l) => l.length > 0);
    onUpdateBullets(updated);
    setIsEditing(false);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-sky-500/10 to-transparent border border-sky-500/20 backdrop-blur-xl p-4 shadow-lg shadow-black/20 flex flex-col space-y-3 transition-all">
      {/* Header của Card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
            AI Daily Standup
          </h3>
          {provider && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-medium text-sky-300">
              <Bot className="w-2.5 h-2.5" />
              <span>{provider}</span>
            </span>
          )}
        </div>

        {bullets.length > 0 && !isLoading && (
          <div className="flex items-center space-x-1.5">
            {onGenerateSummary && (
              <button
                onClick={onGenerateSummary}
                className="flex items-center space-x-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium transition-colors"
                title="Tóm tắt lại bằng AI (⌘↵)"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Tóm tắt lại</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium transition-colors"
              title="Chỉnh sửa nhanh nội dung tóm tắt trước khi gửi"
            >
              {isEditing ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Lưu</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Sửa</span>
                </>
              )}
            </button>

            <button
              onClick={onCopy}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-500/30 text-[11px] font-medium transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Chép</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Nội dung Tóm Tắt */}
      {isLoading ? (
        <div className="py-5 flex flex-col items-center justify-center space-y-2 text-white/50 animate-pulse">
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Đang tổng hợp dữ liệu & tóm tắt bằng AI...</p>
        </div>
      ) : isEditing ? (
        <div className="flex flex-col space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400 font-sans leading-relaxed resize-none"
            placeholder="Mỗi dòng là một gạch đầu dòng..."
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 rounded-md text-[11px] text-white/50 hover:text-white"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 rounded-md bg-sky-500 text-white font-medium text-[11px] shadow-sm"
            >
              Cập nhật
            </button>
          </div>
        </div>
      ) : bullets.length > 0 ? (
        <div className="space-y-1.5 text-xs text-white/90 leading-relaxed font-normal">
          {bullets.map((line, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-sky-400 font-bold select-none">•</span>
              <p className="flex-1">{line}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 flex flex-col items-center justify-center space-y-2.5">
          <p className="text-xs text-white/50 text-center">
            {hasPrs
              ? 'Dữ liệu PR & commits đã sẵn sàng. Nhấn nút bên dưới để tạo bản tóm tắt Daily Standup.'
              : 'Không có PR hoặc commit nào trong khoảng thời gian này.'}
          </p>
          {hasPrs && onGenerateSummary && (
            <button
              onClick={onGenerateSummary}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo tóm tắt Daily Standup</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-black/30 text-[10px] text-white/80 font-mono">
                ⌘↵
              </kbd>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

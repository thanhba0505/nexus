import { useState } from 'react';
import { X, Hash, Lock, Users, User, Plus, Trash2, Check, Shield } from 'lucide-react';
import type { ConversationRule } from '../types';

export interface ConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationRule[];
  defaultPrefix: string;
  onSaveConversations: (rules: ConversationRule[]) => void;
}

export function ConversationsModal({
  isOpen,
  onClose,
  conversations,
  defaultPrefix,
  onSaveConversations,
}: ConversationsModalProps) {
  const [rules, setRules] = useState<ConversationRule[]>(conversations);
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<ConversationRule['type']>('public_channel');

  if (!isOpen) return null;

  const handleToggleEnable = (idx: number) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleModeChange = (idx: number, mode: ConversationRule['mode']) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, mode } : r)));
  };

  const handlePrefixChange = (idx: number, customPrefix: string) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, customPrefix } : r)));
  };

  const handleMentionsChange = (idx: number, autoReplyMentionsOnly: boolean) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, autoReplyMentionsOnly } : r)));
  };

  const handleDeleteRule = (idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddRule = () => {
    const id = newChannelId.trim();
    const name = newChannelName.trim() || id;
    if (!id) return;

    if (rules.some((r) => r.conversationId.toLowerCase() === id.toLowerCase())) {
      alert('Kênh hoặc hội thoại này đã tồn tại trong danh sách whitelist!');
      return;
    }

    const newRule: ConversationRule = {
      conversationId: id,
      name,
      type: newChannelType,
      enabled: true,
      mode: 'draft_review',
      customPrefix: defaultPrefix || '[Bot] ',
      autoReplyMentionsOnly: newChannelType === 'public_channel',
      whitelistUserIds: [],
      blacklistKeywords: [],
    };

    setRules([...rules, newRule]);
    setNewChannelId('');
    setNewChannelName('');
  };

  const handleSave = () => {
    onSaveConversations(rules);
    onClose();
  };

  const getChannelIcon = (type: ConversationRule['type']) => {
    switch (type) {
      case 'public_channel':
        return <Hash className="w-3.5 h-3.5 text-violet-400" />;
      case 'private_channel':
        return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      case 'mpdm':
        return <Users className="w-3.5 h-3.5 text-sky-400" />;
      case 'im':
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900/95 border border-violet-500/30 backdrop-blur-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-violet-500/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-500/20 text-violet-400">
              <Shield className="h-3 w-3" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white/90">
                Quản lý Hội Thoại Cho Phép (Allowed Whitelist)
              </h3>
              <p className="text-[10px] text-white/50">
                Layer 3 Loop Guard: Chỉ các kênh được BẬT ở đây mới được bot lắng nghe và phản hồi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* Add Channel Bar */}
          <div className="p-3 rounded-xl bg-violet-500/[0.04] border border-violet-500/20 space-y-2">
            <span className="text-[11px] font-semibold text-white/80">
              Thêm kênh / DM mới vào whitelist
            </span>
            <div className="flex items-center gap-2">
              <select
                value={newChannelType}
                onChange={(e) => setNewChannelType(e.target.value as ConversationRule['type'])}
                className="bg-black/40 border border-violet-500/25 rounded-lg px-2.5 py-1.5 text-white/90 text-xs focus:outline-hidden focus:border-violet-500"
              >
                <option value="public_channel">Public Channel</option>
                <option value="private_channel">Private Channel</option>
                <option value="mpdm">Group DM (MPDM)</option>
                <option value="im">Direct Message (1-1)</option>
              </select>

              <input
                type="text"
                value={newChannelId}
                onChange={(e) => setNewChannelId(e.target.value)}
                placeholder="Channel ID (vd: C0123ABC)"
                className="w-36 bg-black/40 border border-violet-500/25 rounded-lg px-2.5 py-1.5 text-white/90 text-xs font-mono focus:outline-hidden focus:border-violet-500"
              />

              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Tên kênh (vd: team-standup)"
                className="flex-1 bg-black/40 border border-violet-500/25 rounded-lg px-2.5 py-1.5 text-white/90 text-xs focus:outline-hidden focus:border-violet-500"
              />

              <button
                type="button"
                onClick={handleAddRule}
                disabled={!newChannelId.trim()}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* List of rules */}
          <div className="space-y-2">
            {rules.map((rule, idx) => (
              <div
                key={rule.conversationId}
                className={`p-3 rounded-xl border transition-all ${
                  rule.enabled
                    ? 'bg-violet-500/[0.04] border-violet-500/20'
                    : 'bg-black/20 border-violet-500/10 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleEnable(idx)}
                      className="w-4 h-4 rounded border-violet-500/35 bg-black/40 text-violet-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getChannelIcon(rule.type)}
                      <span className="font-semibold text-white/90 truncate">{rule.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">
                        ({rule.conversationId})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Mode selection */}
                    <select
                      value={rule.mode}
                      onChange={(e) =>
                        handleModeChange(idx, e.target.value as ConversationRule['mode'])
                      }
                      className="bg-black/40 border border-violet-500/25 rounded-lg px-2 py-1 text-white/80 text-[11px] focus:outline-hidden focus:border-violet-500"
                    >
                      <option value="draft_review">Draft & Review</option>
                      <option value="auto_pilot">Auto-Pilot</option>
                      <option value="manual">Manual Chỉ dẫn</option>
                    </select>

                    {/* Custom Prefix */}
                    <input
                      type="text"
                      value={rule.customPrefix ?? ''}
                      onChange={(e) => handlePrefixChange(idx, e.target.value)}
                      placeholder={defaultPrefix}
                      title="Tiền tố riêng cho hội thoại này"
                      className="w-24 bg-black/40 border border-violet-500/25 rounded-lg px-2 py-1 text-white/80 text-[11px] font-mono focus:outline-hidden focus:border-violet-500"
                    />

                    {/* Mentions only toggle */}
                    <label
                      title="Chỉ phản hồi khi có @mention bạn"
                      className="flex items-center gap-1 text-[11px] text-white/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={rule.autoReplyMentionsOnly}
                        onChange={(e) => handleMentionsChange(idx, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-violet-500/35 bg-black/40 text-violet-500 focus:ring-0"
                      />
                      <span>@mention</span>
                    </label>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(idx)}
                      className="p-1 rounded-md text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa khỏi whitelist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="text-center py-8 text-white/40">
                Chưa có hội thoại nào trong danh sách. Hãy thêm Channel ID ở trên.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-violet-500/20 bg-black/20 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-violet-500/25 hover:bg-violet-500/10 text-white/70 hover:text-white text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-600/30 transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Lưu Whitelist</span>
          </button>
        </div>
      </div>
    </div>
  );
}

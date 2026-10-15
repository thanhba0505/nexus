import type { AppSettings, DateMode, WorkflowSettings } from '../types';

/**
 * Mốc thời gian bắt đầu (ISO) theo chế độ ngày.
 * - `today`: 00:00 hôm nay (giờ máy).
 * - `last_workday`: 00:00 ngày làm việc gần nhất (thứ Hai → thứ Sáu, Chủ nhật → thứ Sáu).
 *
 * Tính TẠI THỜI ĐIỂM GỌI (không memo) để không bị lệch khi app mở qua đêm.
 */
export function getSinceIso(mode: DateMode, now: Date = new Date()): string {
  const day = now.getDay();
  const daysBack = mode === 'today' ? 0 : day === 1 ? 3 : day === 0 ? 2 : 1;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack).toISOString();
}

/** Định dạng văn bản tóm tắt để dán vào Parabol / Slack. */
export function formatSummaryText(bullets: string[]): string {
  return ['Today:', '', ...bullets.map((b) => `• ${b}`)].join('\n');
}

/** Tách văn bản người dùng chỉnh sửa thành danh sách bullet sạch. */
export function parseSummaryText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== 'today:');
}

export function getDestinationUrl(workflow: WorkflowSettings): string {
  return workflow.destination === 'slack'
    ? 'https://app.slack.com'
    : workflow.parabolUrl || 'https://action.parabol.co';
}

export function getDestinationLabel(settings: AppSettings): string {
  switch (settings.workflow.destination) {
    case 'parabol':
      return 'Parabol';
    case 'slack':
      return 'Slack';
    default:
      return 'Copy';
  }
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

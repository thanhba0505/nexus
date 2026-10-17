import { invoke } from '@tauri-apps/api/core';
import type { SlackCredentialsDto, SlackStatusDto } from '../types';

/**
 * Lớp gọi Native IPC duy nhất của SlackBot.
 * Toàn bộ command & tham số Rust (camelCase ↔ snake_case) được tập trung tại đây.
 */
export const slackbotApi = {
  checkSlackStatus: () => invoke<SlackStatusDto>('check_slack_status'),

  getSlackCredentials: () => invoke<SlackCredentialsDto>('get_slack_credentials'),

  saveSlackCredentials: (userToken: string, appToken: string) =>
    invoke<void>('save_slack_credentials', { userToken, appToken }),

  deleteSlackCredentials: () => invoke<void>('delete_slack_credentials'),

  connectSocketMode: () => invoke<void>('connect_socket_mode'),

  disconnectSocketMode: () => invoke<void>('disconnect_socket_mode'),
};

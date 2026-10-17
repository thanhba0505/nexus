export interface SlackCredentialsDto {
  hasUserToken: boolean;
  hasAppToken: boolean;
  maskedUserToken: string | null;
  maskedAppToken: string | null;
}

export type SocketStatusType =
  'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'ready_to_connect' | 'error';

export interface SlackStatusDto {
  hasUserToken: boolean;
  hasAppToken: boolean;
  isConnected: boolean;
  socketStatus: SocketStatusType;
  localAiInstalled: boolean;
  localAiEngine: string | null;
  version: string;
}

export interface SlackConversationItem {
  id: string;
  name: string;
  type: 'public_channel' | 'private_channel' | 'mpdm' | 'im';
  isMember?: boolean;
  numMembers?: number;
  topic?: string;
}

export interface SlackMessageItem {
  id: string;
  channelId: string;
  userId: string;
  userName?: string;
  text: string;
  ts: string;
  threadTs?: string;
  hasBotPrefix?: boolean;
}

export interface DraftItem {
  draftId: string;
  channelId: string;
  channelName: string;
  author: string;
  promptContext: string;
  generatedReply: string;
  suggestions: string[];
  createdAt: number;
  status?: 'pending' | 'approved' | 'discarded';
}

export interface IdentityConfig {
  mode: 'user_account';
  userId: string;
  userName: string;
  defaultPrefix: string;
  enablePrefix: boolean;
  botAppModeDisabled: boolean;
}

export interface SlackConnectionConfig {
  socketModeEnabled: boolean;
  reconnectIntervalSec: number;
  maxReconnectAttempts: number;
  autoAckEnvelope: boolean;
}

export interface AIConfig {
  provider: 'auto' | 'claude' | 'agy' | 'cloud';
  localEngine: 'claude' | 'agy' | 'ollama';
  fallbackCloudModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface PersonaConfig {
  displayName: string;
  tone: 'professional_friendly' | 'professional_technical' | 'concise' | 'friendly';
  pronoun: 'mình_bạn' | 'em_anh' | 'tôi_bạn' | 'mình_các_bạn';
  signature: string;
  defaultLanguage: 'vi' | 'en';
}

export interface ConversationRule {
  conversationId: string;
  name: string;
  type: 'public_channel' | 'private_channel' | 'mpdm' | 'im';
  enabled: boolean;
  mode: 'draft_review' | 'auto_pilot' | 'manual';
  customPrefix?: string;
  customTone?: string;
  autoReplyMentionsOnly: boolean;
  whitelistUserIds: string[];
  blacklistKeywords: string[];
}

export interface LoopPreventionConfig {
  enabled: boolean;
  filterSelfPrefix: boolean;
  lruCacheSize: number;
}

export interface DraftInboxConfig {
  retentionHours: number;
  autoDiscardExpired: boolean;
  notifyOnNewDraft: boolean;
  playNotificationSound: boolean;
}

export interface SmartContextConfig {
  maxThreadHistory: number;
  includeChannelTopic: boolean;
  includeUserProfiles: boolean;
}

export interface KnowledgeBaseConfig {
  enabled: boolean;
  localDocsPath: string;
  fileExtensions: string[];
}

export interface SlackAppSettings {
  version: number;
  identity: IdentityConfig;
  slack: SlackConnectionConfig;
  ai: AIConfig;
  persona: PersonaConfig;
  conversations: ConversationRule[];
  loopPrevention: LoopPreventionConfig;
  draftInbox: DraftInboxConfig;
  smartContext: SmartContextConfig;
  knowledgeBase: KnowledgeBaseConfig;
}

export const DEFAULT_SLACK_SETTINGS: SlackAppSettings = {
  version: 2,
  identity: {
    mode: 'user_account',
    userId: '',
    userName: '',
    defaultPrefix: '[Bot] ',
    enablePrefix: true,
    botAppModeDisabled: true,
  },
  slack: {
    socketModeEnabled: true,
    reconnectIntervalSec: 5,
    maxReconnectAttempts: 10,
    autoAckEnvelope: true,
  },
  ai: {
    provider: 'auto',
    localEngine: 'claude',
    fallbackCloudModel: 'claude-3-5-sonnet-latest',
    temperature: 0.3,
    maxTokens: 1024,
    systemPrompt:
      'Bạn là trợ lý kỹ thuật thông minh đại diện cho người dùng trên Slack. Hãy trả lời ngắn gọn, chuẩn xác, ưu tiên giải pháp code rõ ràng, lịch sự và hỗ trợ đồng đội tận tình.',
  },
  persona: {
    displayName: 'Nexus Assistant',
    tone: 'professional_friendly',
    pronoun: 'mình_bạn',
    signature: '— _Soạn tự động bởi SlackBot_',
    defaultLanguage: 'vi',
  },
  conversations: [
    {
      conversationId: 'C_DEMO_PROJECT',
      name: 'proj-nexus-dev',
      type: 'public_channel',
      enabled: true,
      mode: 'draft_review',
      customPrefix: '[Bot] ',
      customTone: 'professional_technical',
      autoReplyMentionsOnly: true,
      whitelistUserIds: [],
      blacklistKeywords: ['pass', 'secret', 'private_key', 'password'],
    },
    {
      conversationId: 'C_DEMO_SANDBOX',
      name: 'sandbox-ai-test',
      type: 'public_channel',
      enabled: true,
      mode: 'auto_pilot',
      customPrefix: '🤖 [AI] ',
      customTone: 'concise',
      autoReplyMentionsOnly: false,
      whitelistUserIds: [],
      blacklistKeywords: [],
    },
    {
      conversationId: 'G_DEMO_STANDUP',
      name: 'standup-sync-group',
      type: 'mpdm',
      enabled: true,
      mode: 'draft_review',
      customPrefix: '[Bot] ',
      customTone: 'friendly',
      autoReplyMentionsOnly: false,
      whitelistUserIds: [],
      blacklistKeywords: [],
    },
    {
      conversationId: 'D_DEMO_DIRECT',
      name: 'direct-lead',
      type: 'im',
      enabled: false,
      mode: 'draft_review',
      customPrefix: '[Trợ Lý] ',
      customTone: 'friendly',
      autoReplyMentionsOnly: false,
      whitelistUserIds: [],
      blacklistKeywords: [],
    },
  ],
  loopPrevention: {
    enabled: true,
    filterSelfPrefix: true,
    lruCacheSize: 100,
  },
  draftInbox: {
    retentionHours: 24,
    autoDiscardExpired: true,
    notifyOnNewDraft: true,
    playNotificationSound: true,
  },
  smartContext: {
    maxThreadHistory: 15,
    includeChannelTopic: true,
    includeUserProfiles: true,
  },
  knowledgeBase: {
    enabled: true,
    localDocsPath: '~/workspace/app/nexus/docs',
    fileExtensions: ['.md', '.txt'],
  },
};

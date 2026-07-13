import type {
  Conversation as DBConversation,
  ConversationMessage as DBMessage,
} from '@bitcode/conversations';

import type { Chat } from '@/components/conversations/hooks/UseChatState/UseChatState';

type ConversationMessageAttachment = {
  attachment_id?: string;
  attachment_category?: string;
  attachment_type?: string;
  metadata?: Record<string, unknown>;
};

type ConversationDetailResponse = DBConversation & {
  message_count?: number;
  attachment_count?: number;
  last_message?: string | null;
  messages?: Array<
    DBMessage & {
      message_attachments?: Array<Record<string, unknown>>;
    }
  >;
};

function readConversationAttachmentString(
  attachment: ConversationMessageAttachment,
  key: string,
) {
  const metadataValue = attachment.metadata?.[key];
  if (typeof metadataValue === 'string' && metadataValue.trim()) {
    return metadataValue.trim();
  }
  return '';
}

function resolveConversationAttachmentTokenType(attachment: ConversationMessageAttachment) {
  const tokenType = readConversationAttachmentString(attachment, 'token_type');
  if (tokenType) return tokenType;

  if (attachment.attachment_category === 'pipeline_run') {
    return 'pipeline_run';
  }

  if (
    attachment.attachment_type === 'output_destination' ||
    attachment.attachment_type === 'settlement_target' ||
    attachment.attachment_type === 'destination'
  ) {
    return 'destination';
  }

  if (attachment.attachment_category === 'integration') {
    return 'source';
  }

  if (attachment.attachment_category === 'file' || attachment.attachment_category === 'url') {
    return 'attachment';
  }

  return 'attachment';
}

function buildConversationPreviewMessages(chatId: string, content?: string | null, updatedAt?: string) {
  const preview = String(content || '').trim();
  if (!preview) {
    return [];
  }

  return [
    {
      id: `preview-${chatId}`,
      type: 'agent' as const,
      content: preview,
      status: 'sent' as const,
      timestamp: updatedAt ? new Date(updatedAt) : new Date(),
    },
  ];
}

export function mapConversationMessageAttachmentToToken(attachment: ConversationMessageAttachment) {
  const type = resolveConversationAttachmentTokenType(attachment);
  const text =
    readConversationAttachmentString(attachment, 'title') ||
    readConversationAttachmentString(attachment, 'value') ||
    readConversationAttachmentString(attachment, 'name') ||
    readConversationAttachmentString(attachment, 'pipelineTitle') ||
    readConversationAttachmentString(attachment, 'path') ||
    String(attachment.attachment_id || '').trim();

  if (!text) {
    return null;
  }

  return {
    id: String(attachment.attachment_id || text),
    type,
    text,
    value: text,
    metadata: {
      attachment_id: attachment.attachment_id,
      category: attachment.attachment_category,
      type: attachment.attachment_type,
      ...(attachment.metadata || {}),
    },
  };
}

export function mapConversationRowToChat(
  row: {
    id: string;
    title?: string | null;
    last_message?: string | null;
    updated_at?: string;
    message_count?: number;
    attachment_count?: number;
  },
  existing?: Chat | null,
): Chat {
  const messages =
    existing?.loaded && existing.messages.length > 0
      ? existing.messages
      : existing?.messages.length
        ? existing.messages
        : buildConversationPreviewMessages(row.id, row.last_message, row.updated_at);

  return {
    id: row.id,
    title: row.title || existing?.title || 'Untitled',
    messages,
    runs: existing?.runs || [],
    latest_run: existing?.latest_run,
    persisted: true,
    loaded: existing?.loaded ?? false,
    updatedAt: row.updated_at,
    messageCount: row.message_count,
    attachmentCount: row.attachment_count,
    lastMessage: row.last_message,
  };
}

export function mapConversationDetailToChat(detail: ConversationDetailResponse, existing?: Chat | null): Chat {
  const lastMessageContent =
    detail.messages && detail.messages.length > 0
      ? detail.messages[detail.messages.length - 1]?.content
      : undefined;

  return {
    id: detail.id,
    title: detail.title || existing?.title || 'Untitled',
    messages: (detail.messages || []).map((message) => ({
      id: String(message.id),
      type: message.role === 'user' ? 'user' : 'agent',
      content: String(message.content || ''),
      tokens: (message.message_attachments || [])
        .map((attachment: Record<string, unknown>) =>
          mapConversationMessageAttachmentToToken(attachment as ConversationMessageAttachment),
        )
        .filter(Boolean),
      status: 'sent',
      timestamp: message.created_at ? new Date(message.created_at) : new Date(),
    })),
    runs: existing?.runs || [],
    latest_run: existing?.latest_run,
    persisted: true,
    loaded: true,
    updatedAt: detail.updated_at,
    messageCount: detail.message_count ?? detail.messages?.length ?? existing?.messageCount,
    attachmentCount: detail.attachment_count ?? existing?.attachmentCount,
    lastMessage: detail.last_message || lastMessageContent || existing?.lastMessage,
  };
}

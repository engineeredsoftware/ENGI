/**
 * Malformed rich response and corrupted message edge cases.
 */
import type {
  ConversationRichMessage,
  ConversationRichResponse,
} from '../types/conversations-rich-response';

export function detectSuspiciousPatterns(input: unknown): {
  isSuspicious: boolean;
  suspiciousPatterns: string[];
  safeToProcess: boolean;
} {
  const suspiciousPatterns: string[] = [];
  const inputStr = JSON.stringify(input).toLowerCase();

  const patterns = [
    /<script/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /\.constructor/gi,
    /__proto__/gi,
    /prototype\.constructor/gi,
  ];

  patterns.forEach((pattern, index) => {
    if (pattern.test(inputStr)) {
      suspiciousPatterns.push(`Pattern ${index + 1}: ${pattern.source}`);
    }
  });

  return {
    isSuspicious: suspiciousPatterns.length > 0,
    suspiciousPatterns,
    safeToProcess: suspiciousPatterns.length === 0,
  };
}

export function sanitizeRichResponseContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:(?!image\/)[^;]*;base64/gi, '');
}

export function sanitizeRichResponse(
  richResponse: Record<string, unknown> | null | undefined,
): ConversationRichResponse | null {
  try {
    if (!richResponse?.id || !richResponse?.type) {
      return null;
    }

    const metadata = (richResponse.metadata || {}) as Record<string, unknown>;

    return {
      id: richResponse.id as string,
      type: richResponse.type as ConversationRichResponse['type'],
      data: (richResponse.data || {}) as ConversationRichResponse['data'],
      metadata: {
        title: (metadata.title as string) || 'Untitled',
        description: (metadata.description as string) || '',
        priority: ['high', 'medium', 'low'].includes(metadata.priority as string)
          ? (metadata.priority as 'high' | 'medium' | 'low')
          : 'medium',
        renderMode: ['inline', 'compact', 'expanded', 'modal'].includes(
          metadata.renderMode as string,
        )
          ? (metadata.renderMode as 'inline' | 'compact' | 'expanded' | 'modal')
          : 'compact',
        interactionLevel: ['read_only', 'interactive', 'editable'].includes(
          metadata.interactionLevel as string,
        )
          ? (metadata.interactionLevel as 'read_only' | 'interactive' | 'editable')
          : 'read_only',
        performance: (metadata.performance as ConversationRichResponse['metadata']['performance']) || {
          renderCost: 'medium',
          updateFrequency: 'static',
        },
      },
      actions: (richResponse.actions as ConversationRichResponse['actions']) || [],
      liveUpdate: richResponse.liveUpdate as ConversationRichResponse['liveUpdate'],
    };
  } catch (error) {
    console.error('Failed to sanitize rich response:', error);
    return null;
  }
}

export function handleCorruptedMessage(
  message: Record<string, unknown>,
  sanitizeOne: (rr: unknown) => ConversationRichResponse | null,
): ConversationRichMessage | null {
  try {
    const repairedMessage: ConversationRichMessage = {
      id: (message.id as string) || `repaired_${Date.now()}`,
      type: (message.type as ConversationRichMessage['type']) || 'agent',
      content: (message.content as string) || '[Message content corrupted]',
      timestamp: message.timestamp ? new Date(message.timestamp as string) : new Date(),
      richResponses: [],
      conversationMetadata: {
        safetyValidated: true,
        autoRichTextReplaced: false,
        surpriseDelightActivated: false,
      },
    };

    if (message.richResponses && Array.isArray(message.richResponses)) {
      repairedMessage.richResponses = message.richResponses
        .map((rr: unknown) => sanitizeOne(rr))
        .filter(Boolean) as ConversationRichResponse[];
    }

    return repairedMessage;
  } catch (error) {
    console.error('Failed to repair corrupted message:', error);
    return null;
  }
}

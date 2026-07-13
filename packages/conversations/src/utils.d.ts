/**
 * Business logic utilities for conversations
 *
 * Pure functions that operate on conversation data
 * No database access - that's in ORM package
 */
import { Conversation, ConversationMessage, MessageAttachment, ConversationWithStats } from './types';
/**
 * Generate a default conversation title from first message
 */
export declare function generateConversationTitle(firstMessage: string): string;
/**
 * Calculate conversation statistics from messages and attachments
 */
export declare function calculateConversationStats(conversation: Conversation, messages: ConversationMessage[], attachments: MessageAttachment[]): ConversationWithStats;
/**
 * Group messages by date for UI display
 */
export declare function groupMessagesByDate(messages: ConversationMessage[]): Map<string, ConversationMessage[]>;
/**
 * Format message for display (truncate, sanitize, etc)
 */
export declare function formatMessageForDisplay(message: ConversationMessage, maxLength?: number): string;
/**
 * Determine if a conversation is active (recent activity)
 */
export declare function isConversationActive(conversation: Conversation, inactiveThresholdHours?: number): boolean;
/**
 * Extract entity references from a message
 */
export declare function extractMessageReferences(_message: ConversationMessage, attachments?: MessageAttachment[]): {
    hasReferences: boolean;
};
/**
 * Sort conversations by activity (most recent first)
 */
export declare function sortConversationsByActivity(conversations: ConversationWithStats[]): ConversationWithStats[];
/**
 * Filter conversations by search term
 */
export declare function filterConversationsBySearch(conversations: ConversationWithStats[], searchTerm: string): ConversationWithStats[];
/**
 * Check if user can perform action on conversation
 * (For now just checks user_id match, can be extended)
 */
export declare function canUserAccessConversation(conversation: Conversation, userId: string): boolean;
/**
 * Create a system message for conversation events
 */
export declare function createSystemMessage(conversationId: string, event: 'created' | 'asset_pack_evidence_attached' | 'evidence_document_attached' | 'connection_attached', metadata?: Record<string, any>): ConversationMessage;

/**
 * Conversation domain types - Bitcode V26 Terminal database mirror
 *
 * These types MUST match the database schema exactly as defined in:
 * - supabase/migrations-archive/20250903_172526/004_conversations_tables.sql (archived creation)
 * - supabase/migrations/001_add_conversation_branching.sql (active alterations)
 *
 * Type: domain-types
 * Pattern: database-mirror
 */
import { AttachmentReference } from '@bitcode/attachments-generics';
export type ConversationMessageRole = 'user' | 'assistant';
/**
 * Conversations table - lightweight wrapper for organizing messages
 * Maps to: conversations table
 */
export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    parent_conversation_id?: string | null;
    branched_from_message_id?: string | null;
}
/**
 * Messages table - messages within conversations
 * Maps to: messages table
 */
export interface ConversationMessage {
    id: string;
    conversation_id: string;
    role: ConversationMessageRole;
    content: string;
    created_at: string;
}
/**
 * Message attachment reference - links messages to attachments
 * Maps to: message_attachments table
 *
 * User messages can have source attachments (VCS, files, URLs, integrations)
 * Assistant messages can have pipeline execution references
 */
export interface MessageAttachment {
    id: string;
    message_id: string;
    attachment_reference: AttachmentReference;
    context?: string;
    metadata?: Record<string, any>;
    created_at: string;
}
export interface CreateConversationInput {
    user_id: string;
    title?: string;
}
export interface CreateMessageInput {
    conversation_id: string;
    role: ConversationMessageRole;
    content: string;
}
export interface CreateMessageAttachmentInput {
    message_id: string;
    attachment_reference: AttachmentReference;
    context?: string;
    metadata?: Record<string, any>;
}
/**
 * Conversation with message count for list views
 */
export interface ConversationWithStats extends Conversation {
    message_count: number;
    last_message_content?: string;
    last_message_at?: string;
    attachment_count: number;
}
/**
 * Message with attachments and their details
 */
export interface MessageWithAttachments extends ConversationMessage {
    attachments: MessageAttachment[];
}
/**
 * Full message with all related data including full attachment objects
 */
export interface MessageWithDetails extends ConversationMessage {
    attachments: MessageAttachment[];
}
/**
 * Full conversation with all related data
 */
export interface ConversationFull extends Conversation {
    messages: MessageWithDetails[];
    stats: {
        message_count: number;
        attachment_count: number;
        last_activity: string;
    };
}
export interface ConversationListOptions {
    limit?: number;
    offset?: number;
    cursor?: string;
    search?: string;
    order_by?: 'created_at' | 'updated_at' | 'title';
    order?: 'asc' | 'desc';
}
export interface ConversationListResult {
    data: ConversationWithStats[];
    total: number;
    has_more: boolean;
    next_cursor?: string;
}
export interface MessageListOptions {
    conversation_id: string;
    limit?: number;
    offset?: number;
    cursor?: string;
    include_details?: boolean;
}
export interface MessageListResult {
    data: ConversationMessage[] | MessageWithDetails[];
    total: number;
    has_more: boolean;
    next_cursor?: string;
}

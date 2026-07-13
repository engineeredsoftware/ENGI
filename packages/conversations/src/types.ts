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

// ==================== ENUMS (matching CHECK constraints) ====================
export type ConversationMessageRole = 'user' | 'assistant';

// ==================== BASE TABLES (exact schema match) ====================

/**
 * Conversations table - lightweight wrapper for organizing messages
 * Maps to: conversations table
 */
export interface Conversation {
  id: string; // UUID
  user_id: string; // UUID -> auth.users(id)
  title: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  // Branching metadata (nullable)
  parent_conversation_id?: string | null;
  branched_from_message_id?: string | null;
}

/**
 * Messages table - messages within conversations
 * Maps to: messages table
 */
export interface ConversationMessage {
  id: string; // UUID
  conversation_id: string; // UUID -> conversations(id)
  role: ConversationMessageRole;
  content: string;
  created_at: string; // TIMESTAMPTZ
}

/**
 * Message attachment reference - links messages to attachments
 * Maps to: message_attachments table
 * 
 * User messages can have source attachments (VCS, files, URLs, integrations)
 * Assistant messages can have pipeline execution references
 */
export interface MessageAttachment {
  id: string; // UUID
  message_id: string; // UUID -> messages(id)
  
  // Reference to the actual attachment (stored separately)
  attachment_reference: AttachmentReference;
  
  // Context for this specific usage
  context?: string; // How this attachment relates to the message
  metadata?: Record<string, any>; // JSONB - message-specific metadata
  
  created_at: string; // TIMESTAMPTZ
}

// ==================== INPUT TYPES (for create/update operations) ====================

export interface CreateConversationInput {
  user_id: string;
  title?: string; // Defaults to 'New Conversation' in DB
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

// ==================== QUERY RESULT TYPES (with joins/aggregates) ====================

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
  // The actual attachment objects are fetched separately
  // and linked via attachment_reference
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

// ==================== PAGINATION TYPES ====================

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

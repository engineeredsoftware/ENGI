/**
 * MESSAGES MODEL - V26 Message management for conversations
 *
 * Provides type-safe database access for message operations
 * matching the V26 schema exactly as defined in migrations
 *
 * Type: orm-model
 * Table: messages
 * Capabilities: crud, streaming, pagination
 */
import { BaseModel } from './base';
import { Database } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConversationMessage, MessageWithDetails, CreateMessageInput, MessageListOptions, MessageListResult } from '@bitcode/conversations';
export declare class MessagesModel extends BaseModel<'messages'> {
    constructor(supabase: SupabaseClient<Database>);
    /**
     * Get messages for a conversation with pagination
     */
    listForConversation(conversationId: string, options?: Partial<MessageListOptions>): Promise<MessageListResult>;
    /**
     * Create a message
     */
    createMessage(input: CreateMessageInput): Promise<ConversationMessage>;
    /**
     * Stream update a message (for progressive content updates)
     */
    streamUpdate(messageId: string, content: string, isComplete?: boolean): Promise<ConversationMessage>;
    /**
     * Get the last message in a conversation
     */
    getLastMessage(conversationId: string): Promise<ConversationMessage | null>;
    /**
     * Get message with all attachments and their details
     */
    getWithDetails(messageId: string): Promise<MessageWithDetails | null>;
    /**
     * Count messages by role in a conversation
     */
    countByRole(conversationId: string): Promise<{
        user: number;
        assistant: number;
    }>;
    /**
     * Delete all messages in a conversation
     */
    deleteByConversation(conversationId: string): Promise<void>;
}

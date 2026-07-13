/**
 * CONVERSATIONS MODEL - V26 Conversation management
 *
 * Provides type-safe database access for conversation operations
 * matching the V26 schema exactly as defined in migrations
 *
 * Type: orm-model
 * Table: conversations
 * Capabilities: crud, user-scoped, pagination, stats
 */
import { BaseModel } from './base';
import { Database } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { Conversation, ConversationListOptions, ConversationListResult } from '@bitcode/conversations';
export declare class ConversationsModel extends BaseModel<'conversations'> {
    constructor(supabase: SupabaseClient<Database>);
    /**
     * List conversations with stats for a user
     */
    listWithStats(userId: string, options?: ConversationListOptions): Promise<ConversationListResult>;
    /**
     * Get conversation by ID for a specific user (RLS enforcement)
     */
    findByIdForUser(conversationId: string, userId: string): Promise<Conversation | null>;
    /**
     * Create conversation with optional initial message
     */
    createWithMessage(input: {
        user_id: string;
        title?: string;
        initialMessage?: {
            role: 'user' | 'assistant';
            content: string;
        };
    }): Promise<Conversation>;
    /**
     * Get recent conversations for a user
     */
    getRecent(userId: string, limit?: number): Promise<Conversation[]>;
    /**
     * Update conversation title
     */
    updateTitle(conversationId: string, title: string): Promise<Conversation>;
    /**
     * Touch conversation (update updated_at)
     */
    touch(conversationId: string): Promise<Conversation>;
    /**
     * Delete conversation and all related data (cascades)
     */
    deleteWithRelated(conversationId: string, userId: string): Promise<void>;
    /**
     * Count conversations for a user
     */
    countForUser(userId: string): Promise<number>;
    /**
     * Get conversation statistics
     */
    getStats(conversationId: string): Promise<{
        messageCount: number;
        attachmentCount: number;
        lastActivity: string | null;
    }>;
}

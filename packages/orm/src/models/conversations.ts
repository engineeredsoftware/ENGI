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
import {
  Conversation,
  ConversationWithStats,
  ConversationListOptions,
  ConversationListResult,
  CreateConversationInput
} from '@bitcode/conversations';

type ConversationMessageRow = {
  id: string;
  content: string;
  created_at: string;
};

type ConversationWithMessagesRow = Conversation & {
  messages?: ConversationMessageRow[] | null;
};

export class ConversationsModel extends BaseModel<'conversations'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'conversations');
  }

  /**
   * List conversations with stats for a user
   */
  async listWithStats(
    userId: string,
    options: ConversationListOptions = {}
  ): Promise<ConversationListResult> {
    const { 
      limit = 50, 
      offset = 0,
      cursor, 
      search,
      order_by = 'updated_at',
      order = 'desc'
    } = options;

    // Build query with message counts and last message info
    let query = this.supabase
      .from('conversations')
      .select(`
        *,
        messages!conversation_id (
          id,
          content,
          created_at
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order(order_by, { ascending: order === 'asc' });

    // Apply cursor-based pagination if cursor provided
    if (cursor) {
      if (order === 'desc') {
        query = query.lt(order_by, cursor);
      } else {
        query = query.gt(order_by, cursor);
      }
    } else if (offset > 0) {
      // Fallback to offset pagination
      query = query.range(offset, offset + limit - 1);
    } else {
      query = query.limit(limit + 1); // Fetch one extra to check hasMore
    }

    // Apply search filter
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Process results to match ConversationWithStats
    const hasMore = Boolean(data && data.length > limit);
    const conversations = (hasMore ? data.slice(0, limit) : (data || [])) as ConversationWithMessagesRow[];
    
    const results: ConversationWithStats[] = conversations.map((conv): ConversationWithStats => {
      const messages = conv.messages || [];
      const lastMessage = [...messages].sort((a: ConversationMessageRow, b: ConversationMessageRow) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        ...conv,
        message_count: messages.length,
        last_message_content: lastMessage?.content,
        last_message_at: lastMessage?.created_at,
        attachment_count: 0 // TODO: Count message attachments instead
      };
    });

    const nextCursor = hasMore && results.length > 0
      ? results[results.length - 1][order_by]
      : undefined;

    return {
      data: results,
      total: count || 0,
      has_more: hasMore,
      next_cursor: nextCursor
    };
  }

  /**
   * Get conversation by ID for a specific user (RLS enforcement)
   */
  async findByIdForUser(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return (data as Conversation) || null;
  }

  /**
   * Create conversation with optional initial message
   */
  async createWithMessage(input: {
    user_id: string;
    title?: string;
    initialMessage?: {
      role: 'user' | 'assistant';
      content: string;
    };
  }): Promise<Conversation> {
    // Create conversation
    const conversation = await this.create({
      user_id: input.user_id,
      title: input.title || 'New Conversation'
    }) as Conversation;

    // Create initial message if provided
    if (input.initialMessage) {
      await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          role: input.initialMessage.role,
          content: input.initialMessage.content
        });

      // Update conversation updated_at to reflect new message
      await this.update(conversation.id, {
        updated_at: new Date().toISOString()
      });
    }

    return conversation;
  }

  /**
   * Get recent conversations for a user
   */
  async getRecent(userId: string, limit = 10): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Conversation[];
  }

  /**
   * Update conversation title
   */
  async updateTitle(
    conversationId: string,
    title: string
  ): Promise<Conversation> {
    return this.update(conversationId, {
      title,
      updated_at: new Date().toISOString()
    }) as Promise<Conversation>;
  }

  /**
   * Touch conversation (update updated_at)
   */
  async touch(conversationId: string): Promise<Conversation> {
    return this.update(conversationId, {
      updated_at: new Date().toISOString()
    }) as Promise<Conversation>;
  }

  /**
   * Delete conversation and all related data (cascades)
   */
  async deleteWithRelated(conversationId: string, userId: string): Promise<void> {
    // Verify ownership
    const conversation = await this.findByIdForUser(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // Delete will cascade to messages and attachments
    await this.delete(conversationId);
  }

  /**
   * Count conversations for a user
   */
  async countForUser(userId: string): Promise<number> {
    return this.count({ user_id: userId } as any);
  }

  /**
   * Get conversation statistics
   */
  async getStats(conversationId: string): Promise<{
    messageCount: number;
    attachmentCount: number;
    lastActivity: string | null;
  }> {
    const messages = await this.supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);
    
    // TODO: Count message attachments instead of conversation attachments
    const attachments = { count: 0 };

    const lastMessage = await this.supabase
      .from('messages')
      .select('created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      messageCount: messages.count || 0,
      attachmentCount: attachments.count || 0,
      lastActivity: lastMessage.data?.created_at || null
    };
  }
}

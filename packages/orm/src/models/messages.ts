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
import {
  ConversationMessage,
  MessageWithDetails,
  CreateMessageInput,
  MessageListOptions,
  MessageListResult
} from '@bitcode/conversations';

export class MessagesModel extends BaseModel<'messages'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'messages');
  }

  /**
   * Get messages for a conversation with pagination
   */
  async listForConversation(
    conversationId: string,
    options: Partial<MessageListOptions> = {}
  ): Promise<MessageListResult> {
    const {
      limit = 50,
      offset = 0,
      cursor,
      include_details = false
    } = options;

    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Apply cursor-based pagination if cursor provided
    if (cursor) {
      query = query.gt('created_at', cursor);
    } else if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    } else {
      query = query.limit(limit + 1); // Fetch one extra to check hasMore
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const hasMore = data && data.length > limit;
    const messages = hasMore ? data.slice(0, limit) : (data || []);

    // Transform to MessageWithDetails if details included
    const results = messages as unknown as ConversationMessage[];

    const nextCursor = hasMore && results.length > 0
      ? results[results.length - 1].created_at
      : undefined;

    return {
      data: results,
      total: count || 0,
      has_more: hasMore,
      next_cursor: nextCursor
    };
  }

  /**
   * Create a message
   */
  async createMessage(input: CreateMessageInput): Promise<ConversationMessage> {
    const message = await this.create({
      conversation_id: input.conversation_id,
      role: input.role,
      content: input.content
    });

    // Touch the conversation to update its timestamp
    await this.supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.conversation_id);

    return message as unknown as ConversationMessage;
  }

  /**
   * Stream update a message (for progressive content updates)
   */
  async streamUpdate(
    messageId: string,
    content: string,
    isComplete = false
  ): Promise<ConversationMessage> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ content })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    // If streaming is complete, touch the conversation
    if (isComplete) {
      const message = data as ConversationMessage;
      await this.supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', message.conversation_id);
    }

    return data as unknown as ConversationMessage;
  }

  /**
   * Get the last message in a conversation
   */
  async getLastMessage(conversationId: string): Promise<ConversationMessage | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return (data as unknown as ConversationMessage | null) || null;
  }

  /**
   * Get message with all attachments and their details
   */
  async getWithDetails(messageId: string): Promise<MessageWithDetails | null> {
    const { data: message, error: messageError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', messageId)
      .single();

    if (messageError) {
      if (messageError.code === 'PGRST116') return null;
      throw messageError;
    }

    // Get message-level attachments (V26)
    const { data: attachments, error: attachError } = await this.supabase
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId);

    if (attachError) throw attachError;

    return {
      ...(message as any),
      attachments: (attachments || []) as any
    } as any;
  }

  /**
   * Count messages by role in a conversation
   */
  async countByRole(conversationId: string): Promise<{
    user: number;
    assistant: number;
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('role')
      .eq('conversation_id', conversationId);

    if (error) throw error;

    const counts = { user: 0, assistant: 0 };
    (data || []).forEach((msg: { role: string }) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        counts[msg.role] += 1;
      }
    });

    return counts;
  }

  /**
   * Delete all messages in a conversation
   */
  async deleteByConversation(conversationId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('conversation_id', conversationId);

    if (error) throw error;
  }

}

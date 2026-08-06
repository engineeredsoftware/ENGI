/**
 * MESSAGE ATTACHMENTS MODEL - V26 Attachment management
 * 
 * Manages attachment references at the message level for conversations
 * Each attachment reference belongs to a specific message
 * 
 * Type: orm-model
 * Table: message_attachments
 * Capabilities: crud, message-scoped, attachment-refs
 */

import { BaseModel } from './base';
import { Database, Tables } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  MessageAttachment,
  CreateMessageAttachmentInput
} from '@bitcode/conversations';

type MessageAttachmentRow = Tables<'message_attachments'>;

function asMetadata(value: MessageAttachmentRow['metadata']): Record<string, any> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : undefined;
}

function toMessageAttachment(row: MessageAttachmentRow): MessageAttachment {
  return {
    id: row.id,
    message_id: row.message_id,
    attachment_reference: {
      attachment_id: row.attachment_id,
      category: row.attachment_category as MessageAttachment['attachment_reference']['category'],
      type: row.attachment_type ?? undefined,
    },
    context: row.context ?? undefined,
    metadata: asMetadata(row.metadata),
    created_at: row.created_at ?? '',
  };
}

export class MessageAttachmentsModel extends BaseModel<'message_attachments'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'message_attachments');
  }

  /**
   * Get attachments for a specific message
   */
  async findByMessage(messageId: string): Promise<MessageAttachment[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(toMessageAttachment);
  }

  /**
   * Get attachments for an entire conversation
   */
  async findByConversation(conversationId: string): Promise<MessageAttachment[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        messages!inner(conversation_id)
      `)
      .eq('messages.conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(toMessageAttachment);
  }

  /**
   * Create an attachment for a message
   */
  async createForMessage(
    messageId: string,
    input: Omit<CreateMessageAttachmentInput, 'message_id'>
  ): Promise<MessageAttachment> {
    const row = await this.create({
      message_id: messageId,
      attachment_id: input.attachment_reference.attachment_id,
      attachment_category: input.attachment_reference.category,
      attachment_type: input.attachment_reference.type ?? null,
      context: input.context ?? null,
      metadata: input.metadata || {},
    });
    return toMessageAttachment(row);
  }

  /**
   * Create multiple attachments for a message
   */
  async createManyForMessage(
    messageId: string,
    attachments: Array<Omit<CreateMessageAttachmentInput, 'message_id'>>
  ): Promise<MessageAttachment[]> {
    const data = attachments.map(att => ({
      message_id: messageId,
      attachment_id: att.attachment_reference.attachment_id,
      attachment_category: att.attachment_reference.category,
      attachment_type: att.attachment_reference.type ?? null,
      context: att.context ?? null,
      metadata: att.metadata || {},
    }));

    const rows = await this.createMany(data);
    return rows.map(toMessageAttachment);
  }

  /**
   * Get attachments of a specific type for a conversation
   */
  async findByType(
    conversationId: string,
    attachmentType: string
  ): Promise<MessageAttachment[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        messages!inner(conversation_id)
      `)
      .eq('messages.conversation_id', conversationId)
      .eq('attachment_type', attachmentType)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(toMessageAttachment);
  }

  /**
   * Count attachments by type for a message
   */
  async countByTypeForMessage(messageId: string): Promise<{
    assetPackEvidence: number;
    evidence_document: number;
    connection: number;
    pipeline_run: number;
    file: number;
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('attachment_type')
      .eq('message_id', messageId);

    if (error) throw error;

    const counts = {
      assetPackEvidence: 0,
      evidence_document: 0,
      connection: 0,
      pipeline_run: 0,
      file: 0
    };

    (data || []).forEach((att: { attachment_type: string | null }) => {
      if (att.attachment_type === 'asset_pack_evidence') {
        counts.assetPackEvidence++;
        return;
      }

      if (att.attachment_type && att.attachment_type in counts) {
        counts[att.attachment_type as keyof typeof counts]++;
      }
    });

    return counts;
  }

  /**
   * Get all pipeline executions referenced in a conversation
   */
  async getPipelineRunsForConversation(conversationId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        attachment_id,
        messages!inner(conversation_id)
      `)
      .eq('messages.conversation_id', conversationId)
      .eq('attachment_type', 'pipeline_run');

    if (error) throw error;

    // Return unique pipeline execution IDs
    const runIds = new Set<string>();
    (data || []).forEach((att: { attachment_id: string | null }) => {
      if (att.attachment_id) {
        runIds.add(att.attachment_id);
      }
    });

    return Array.from(runIds);
  }

  /**
   * Delete all attachments for a message
   */
  async deleteByMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('message_id', messageId);

    if (error) throw error;
  }
}

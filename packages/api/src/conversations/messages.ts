/**
 * Message operations
 * All message CRUD operations with attachment support
 */

import { supabaseAdmin } from '@bitcode/supabase';
// Use DB table type for strong alignment with current schema
import type { Message } from '@bitcode/orm';
import { AttachmentReference } from '@bitcode/attachment-generics';
import { log } from '@bitcode/logger';
import * as crypto from 'crypto';
import {
  buildPersistedConversationMessageRecord,
  redactConversationPersistenceValue,
} from './privacy';

export interface CreateMessageOptions {
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: AttachmentReference[];
  pipeline_run_id?: string;
}

function resolveAttachmentReferenceId(attachment: AttachmentReference & { id?: string }) {
  return attachment.attachment_id || attachment.id || crypto.randomUUID();
}

export async function createMessage(options: CreateMessageOptions): Promise<Message> {
  const messageId = crypto.randomUUID();
  const persistedMessage = buildPersistedConversationMessageRecord({
    conversationId: options.conversation_id,
    messageId,
    role: options.role,
    content: options.content,
  });
  
  // Create message
  const { data: message, error: messageError } = await supabaseAdmin
    .from('messages')
    .insert({
      id: messageId,
      conversation_id: options.conversation_id,
      role: options.role,
      content: persistedMessage.content,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (messageError) {
    log('[api/messages] Failed to create message', 'error', {
      error: messageError,
      conversationId: options.conversation_id,
      role: options.role,
      persistencePrivacy: persistedMessage.envelope,
    });
    throw messageError;
  }

  // Create message attachments if provided
  if (options.attachments && options.attachments.length > 0) {
    const attachmentRecords = options.attachments.map(att => ({
      id: crypto.randomUUID(),
      message_id: messageId,
      attachment_id: resolveAttachmentReferenceId(att as AttachmentReference & { id?: string }),
      attachment_category: att.category,
      attachment_type: att.type,
      metadata: redactConversationPersistenceValue(att).value
    }));

    const { error: attachError } = await supabaseAdmin
      .from('message_attachments')
      .insert(attachmentRecords);

    if (attachError) {
      log('[api/messages] Failed to create message attachments', 'error', { error: attachError, messageId });
      // Continue without attachments
    }
  }

  // Handle pipeline execution attachment for assistant messages
  if (options.role === 'assistant' && options.pipeline_run_id) {
    const { error: pipelineError } = await supabaseAdmin
      .from('message_attachments')
      .insert({
        id: crypto.randomUUID(),
        message_id: messageId,
        attachment_id: options.pipeline_run_id,
        attachment_category: 'pipeline_run',
        attachment_type: 'pipeline_run',
        metadata: { pipeline_run_id: options.pipeline_run_id }
      });

    if (pipelineError) {
      log('[api/messages] Failed to attach pipeline execution', 'error', { error: pipelineError, messageId });
    }
  }

  // Update conversation's updated_at
  await supabaseAdmin
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', options.conversation_id);

  return message;
}

export async function getMessages(conversationId: string, options: {
  limit?: number;
  cursor?: string;
} = {}): Promise<{
  data: Message[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  const limit = options.limit || 100;
  let query = supabaseAdmin
    .from('messages')
    .select(`
      *,
      message_attachments (
        id,
        attachment_id,
        attachment_category,
        attachment_type,
        metadata
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit + 1);

  if (options.cursor) {
    query = query.gt('created_at', options.cursor);
  }

  const { data, error } = await query;

  if (error) {
    log('[api/messages] Failed to get messages', 'error', { error, conversationId });
    throw error;
  }

  const hasMore = data.length > limit;
  const messages = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? messages[messages.length - 1].created_at : undefined;

  return {
    data: messages,
    hasMore,
    nextCursor
  };
}

export async function getMessage(messageId: string): Promise<Message | null> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select(`
      *,
      message_attachments (
        id,
        attachment_id,
        attachment_category,
        attachment_type,
        metadata
      )
    `)
    .eq('id', messageId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    log('[api/messages] Failed to get message', 'error', { error, messageId });
    throw error;
  }

  return data;
}

export async function updateMessage(
  messageId: string,
  updates: Partial<Pick<Message, 'content'>>
): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .update(updates)
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    log('[api/messages] Failed to update message', 'error', { error, messageId });
    throw error;
  }

  return data;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    log('[api/messages] Failed to delete message', 'error', { error, messageId });
    throw error;
  }
}

export async function createPipelineCompletionMessage(options: {
  conversation_id: string;
  type: string;
  pipeline_id: string;
  result_summary: string;
  success: boolean;
  error?: string;
}): Promise<Message> {
  const content = options.success 
    ? `Pipeline completed: ${options.result_summary}`
    : `Pipeline failed: ${options.error || 'Unknown error'}`;

  return createMessage({
    conversation_id: options.conversation_id,
    role: 'assistant',
    content,
    pipeline_run_id: options.pipeline_id
  });
}

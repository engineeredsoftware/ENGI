/**
 * Conversation operations
 * All conversation CRUD operations
 */

import { supabaseAdmin } from '@bitcode/supabase';
import { Conversation } from '@bitcode/conversations';
import { log } from '@bitcode/logger';
import * as crypto from 'crypto';

interface ConversationMessageAttachmentRow {
  id: string;
  message_id: string;
  attachment_id: string;
  attachment_category: string;
  attachment_type: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

interface ConversationMessageRow {
  id: string;
  content: string | null;
  role: string;
  created_at: string;
  message_attachments?: ConversationMessageAttachmentRow[] | null;
}

interface ConversationRowWithMessages extends Conversation {
  messages?: ConversationMessageRow[] | null;
}

function buildBranchedConversationAttachmentRows(options: {
  sourceMessages: ConversationMessageRow[];
  copiedMessageIdsBySourceId: Map<string, string>;
}) {
  return options.sourceMessages.flatMap((message) => {
    const destinationMessageId = options.copiedMessageIdsBySourceId.get(message.id);
    if (!destinationMessageId || !Array.isArray(message.message_attachments)) {
      return [];
    }

    return message.message_attachments.flatMap((attachment) => {
      if (!attachment.attachment_category || !attachment.attachment_type) {
        return [];
      }

      return [
        {
          id: crypto.randomUUID(),
          message_id: destinationMessageId,
          attachment_id: attachment.attachment_id,
          attachment_category: attachment.attachment_category,
          attachment_type: attachment.attachment_type,
          metadata: attachment.metadata || {},
          created_at: attachment.created_at || message.created_at,
        },
      ];
    });
  });
}

export async function createConversation(userId: string, title?: string): Promise<Conversation> {
  const id = crypto.randomUUID();
  
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      id,
      user_id: userId,
      title: title || 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    log('[api/conversations] Failed to create conversation', 'error', { error, userId });
    throw error;
  }

  return data;
}

export async function getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    log('[api/conversations] Failed to get conversation', 'error', { error, conversationId, userId });
    throw error;
  }

  return data;
}

export async function listConversations(userId: string, options: {
  limit?: number;
  cursor?: string;
  search?: string;
} = {}): Promise<{
  data: Array<Conversation & {
    message_count: number;
    last_message: string | null;
    attachment_count: number;
  }>;
  hasMore: boolean;
  nextCursor?: string;
}> {
  const limit = options.limit || 50;
  let query = supabaseAdmin
    .from('conversations')
    .select(`
      *,
      messages!conversation_id (
        id,
        content,
        created_at,
        message_attachments (
          id
        )
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit + 1);

  if (options.search && options.search.trim()) {
    // Simple title search; can be extended to last message later
    query = query.ilike('title', `%${options.search.trim()}%`);
  }

  if (options.cursor) {
    query = query.lt('updated_at', options.cursor);
  }

  const { data, error } = await query;

  if (error) {
    log('[api/conversations] Failed to list conversations', 'error', { error, userId });
    throw error;
  }

  const hasMore = data.length > limit;
  const conversations = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? conversations[conversations.length - 1].updated_at : undefined;
  const enrichedConversations = (conversations as ConversationRowWithMessages[]).map((conversation) => {
    const messages = Array.isArray(conversation.messages) ? [...conversation.messages] : [];
    const lastMessage = messages.sort((left, right) => right.created_at.localeCompare(left.created_at))[0];

    return {
      ...conversation,
      message_count: messages.length,
      last_message: lastMessage?.content || null,
      attachment_count: messages.reduce((count, message) => {
        return count + (Array.isArray(message.message_attachments) ? message.message_attachments.length : 0);
      }, 0),
    };
  });

  return {
    data: enrichedConversations,
    hasMore,
    nextCursor
  };
}

/**
 * Branch an existing conversation into a new conversation.
 * - Creates a new conversation with optional title
 * - Optionally copies all messages up to a specified message ID (inclusive)
 * - Records parent and branch metadata on the new conversation
 */
export async function branchConversation(
  userId: string,
  sourceConversationId: string,
  options: { title?: string; branchMessageId?: string; copyMessages?: boolean } = {}
): Promise<Conversation & { copiedCount?: number; copiedAttachmentCount?: number } > {
  // Verify source conversation ownership
  const { data: source, error: sourceErr } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', sourceConversationId)
    .eq('user_id', userId)
    .single();
  if (sourceErr || !source) {
    log('[api/conversations] Branch failed: source conversation not found or not owned', 'error', { userId, sourceConversationId, error: sourceErr });
    throw new Error('Source conversation not found');
  }

  // Create destination conversation with parent metadata
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const { data: dest, error: destErr } = await supabaseAdmin
    .from('conversations')
    .insert({
      id: newId,
      user_id: userId,
      title: options.title || `${source.title} (branch)` ,
      parent_conversation_id: sourceConversationId,
      branched_from_message_id: options.branchMessageId || null,
      created_at: now,
      updated_at: now
    })
    .select('*')
    .single();
  if (destErr) {
    log('[api/conversations] Branch failed: cannot create destination conversation', 'error', { userId, sourceConversationId, error: destErr });
    throw destErr;
  }

  let copiedCount = 0;
  let copiedAttachmentCount = 0;
  if (options.copyMessages !== false) {
    // Copy messages from source → dest, optionally up to branchMessageId
    // Fetch in ascending order
    const { data: msgs, error: msgsErr } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        message_attachments (
          id,
          message_id,
          attachment_id,
          attachment_category,
          attachment_type,
          metadata,
          created_at
        )
      `)
      .eq('conversation_id', sourceConversationId)
      .order('created_at', { ascending: true });
    if (msgsErr) {
      log('[api/conversations] Branch warning: could not load source messages', 'warn', {
        userId,
        sourceConversationId,
        error: msgsErr,
      });
    } else {
      const untilId = options.branchMessageId;
      const orderedMessages = (msgs ?? []) as ConversationMessageRow[];
      const toCopy = untilId
        ? orderedMessages.reduce<{ copying: boolean; rows: ConversationMessageRow[] }>((acc, message) => {
            if (!acc.copying) {
              return acc;
            }

            acc.rows.push(message);
            if (message.id === untilId) {
              acc.copying = false;
            }
            return acc;
          }, { copying: true, rows: [] }).rows
        : orderedMessages;

      if (toCopy.length) {
        // Insert copied messages; generate new IDs and set destination conversation
        const rows = toCopy.map((message) => ({
          id: crypto.randomUUID(),
          conversation_id: dest.id,
          role: message.role,
          content: message.content,
          created_at: message.created_at
        }));
        const { error: insertErr } = await supabaseAdmin
          .from('messages')
          .insert(rows);
        if (insertErr) {
          log('[api/conversations] Branch warning: failed to copy messages', 'warn', { error: insertErr, count: rows.length });
        } else {
          copiedCount = rows.length;

          const copiedMessageIdsBySourceId = new Map(
            toCopy.map((message, index) => [message.id, rows[index]?.id] as const),
          );
          const copiedAttachmentRows = buildBranchedConversationAttachmentRows({
            sourceMessages: toCopy,
            copiedMessageIdsBySourceId,
          });

          if (copiedAttachmentRows.length > 0) {
            const { error: attachmentInsertErr } = await supabaseAdmin
              .from('message_attachments')
              .insert(copiedAttachmentRows);
            if (attachmentInsertErr) {
              log('[api/conversations] Branch warning: failed to copy message attachments', 'warn', {
                error: attachmentInsertErr,
                count: copiedAttachmentRows.length,
              });
            } else {
              copiedAttachmentCount = copiedAttachmentRows.length;
            }
          }
        }
      }
    }
  }

  return { ...dest, copiedCount, copiedAttachmentCount } as any;
}

export async function updateConversation(
  conversationId: string, 
  userId: string,
  updates: Partial<Pick<Conversation, 'title'>>
): Promise<Conversation> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    log('[api/conversations] Failed to update conversation', 'error', { error, conversationId, userId });
    throw error;
  }

  return data;
}

export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    log('[api/conversations] Failed to delete conversation', 'error', { error, conversationId, userId });
    throw error;
  }
}

export async function findOrCreateConversationForPipeline(
  userId: string,
  pipelineType: string,
  pipelineId: string
): Promise<Conversation> {
  // For current schema (no conversation.metadata), simply create a new conversation
  // Caller can decide reuse semantics at a higher level if needed.
  return createConversation(userId, `${pipelineType} Pipeline`);
}

export async function getConversationWithAll(conversationId: string, userId: string): Promise<any> {
  // Get conversation
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) return null;

  // Get all messages with attachments
  const { data: messages } = await supabaseAdmin
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
    .order('created_at', { ascending: true });

  return {
    ...conversation,
    messages: messages || []
  };
}

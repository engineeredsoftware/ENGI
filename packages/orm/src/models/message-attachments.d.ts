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
import { Database } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { MessageAttachment, CreateMessageAttachmentInput } from '@bitcode/conversations';
export declare class MessageAttachmentsModel extends BaseModel<'message_attachments'> {
    constructor(supabase: SupabaseClient<Database>);
    /**
     * Get attachments for a specific message
     */
    findByMessage(messageId: string): Promise<MessageAttachment[]>;
    /**
     * Get attachments for an entire conversation
     */
    findByConversation(conversationId: string): Promise<MessageAttachment[]>;
    /**
     * Create an attachment for a message
     */
    createForMessage(messageId: string, input: Omit<CreateMessageAttachmentInput, 'message_id'>): Promise<MessageAttachment>;
    /**
     * Create multiple attachments for a message
     */
    createManyForMessage(messageId: string, attachments: Array<Omit<CreateMessageAttachmentInput, 'message_id'>>): Promise<MessageAttachment[]>;
    /**
     * Get attachments of a specific type for a conversation
     */
    findByType(conversationId: string, attachmentType: string): Promise<MessageAttachment[]>;
    /**
     * Count attachments by type for a message
     */
    countByTypeForMessage(messageId: string): Promise<{
        assetPackEvidence: number;
        evidence_document: number;
        connection: number;
        pipeline_run: number;
        file: number;
    }>;
    /**
     * Get all pipeline executions referenced in a conversation
     */
    getPipelineRunsForConversation(conversationId: string): Promise<string[]>;
    /**
     * Delete all attachments for a message
     */
    deleteByMessage(messageId: string): Promise<void>;
}

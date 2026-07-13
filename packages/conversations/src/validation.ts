/**
 * Validation utilities for conversation domain
 * 
 * Ensures data integrity before database operations
 */

import {
  ConversationMessageRole,
  CreateConversationInput,
  CreateMessageInput,
  CreateMessageAttachmentInput
} from './types';

import { validateAttachmentCategory } from '@bitcode/attachments-generics';

/**
 * Validate message role
 */
export function isValidMessageRole(role: string): role is ConversationMessageRole {
  return role === 'user' || role === 'assistant';
}


/**
 * Validate conversation creation input
 */
export function validateConversationInput(input: CreateConversationInput): void {
  if (!input.user_id) {
    throw new Error('user_id is required');
  }
  
  if (!isValidUUID(input.user_id)) {
    throw new Error('user_id must be a valid UUID');
  }
  
  if (input.title !== undefined && typeof input.title !== 'string') {
    throw new Error('title must be a string');
  }
  
  if (input.title && input.title.length > 255) {
    throw new Error('title must be 255 characters or less');
  }
}

/**
 * Validate message creation input
 */
export function validateMessageInput(input: CreateMessageInput): void {
  if (!input.conversation_id) {
    throw new Error('conversation_id is required');
  }
  
  if (!isValidUUID(input.conversation_id)) {
    throw new Error('conversation_id must be a valid UUID');
  }
  
  if (!isValidMessageRole(input.role)) {
    throw new Error('role must be "user" or "assistant"');
  }
  
  if (!input.content || typeof input.content !== 'string') {
    throw new Error('content is required and must be a string');
  }
}

/**
 * Validate message attachment creation input
 */
export function validateMessageAttachmentInput(input: CreateMessageAttachmentInput): void {
  if (!input.message_id) {
    throw new Error('message_id is required');
  }
  
  if (!isValidUUID(input.message_id)) {
    throw new Error('message_id must be a valid UUID');
  }
  
  if (!input.attachment_reference) {
    throw new Error('attachment_reference is required');
  }
  
  if (!input.attachment_reference.attachment_id) {
    throw new Error('attachment_reference.attachment_id is required');
  }
  
  if (!isValidUUID(input.attachment_reference.attachment_id)) {
    throw new Error('attachment_reference.attachment_id must be a valid UUID');
  }
  
  if (!input.attachment_reference.category) {
    throw new Error('attachment_reference.category is required');
  }
  
  if (!validateAttachmentCategory(input.attachment_reference.category)) {
    throw new Error('attachment_reference.category must be one of: vcs, file, url, integration');
  }
}

/**
 * Simple UUID validation
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
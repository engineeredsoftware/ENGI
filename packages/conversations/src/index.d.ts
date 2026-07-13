/**
 * @bitcode/conversations-generics - Conversation domain types and utilities
 *
 * This package provides Bitcode V26 Terminal conversation type definitions
 * for conversations, messages, and attachments. No database access here - that's in ORM.
 *
 * Bitcode V26 version: 1.0.0
 * Pattern: domain-types
 * Philosophy: "Types as single source of truth"
 */
export * from './types';
export * from './validation';
export * from './utils';
export * from './agent/ConversationAgent';
export { BitcodeTerminalConversationSystemPrompt, BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT } from './prompts/BitcodeTerminalConversationSystemPrompt';

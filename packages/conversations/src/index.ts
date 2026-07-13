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

// Export all types
export * from './types';

// Export validation utilities
export * from './validation';

// Export business logic helpers
export * from './utils';

// Export conversation agent
export * from './agent/ConversationAgent';

// Export Bitcode Terminal conversation system prompt
export {
  BitcodeTerminalConversationSystemPrompt,
  BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT
} from './prompts/BitcodeTerminalConversationSystemPrompt';

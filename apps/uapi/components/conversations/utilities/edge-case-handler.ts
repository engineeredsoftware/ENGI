/**
 * CONVERSATIONS EDGE CASE HANDLER - BULLETPROOF PRODUCTION SYSTEM
 *
 * Multi-concern implementation lives under ./edge-case/.
 * This module is the stable public entry for imports and tests.
 *
 * Concerns (see implementation file regions):
 * - network / connectivity
 * - malformed data / corrupted messages
 * - performance / accessibility
 * - validation / sanitization
 */
export {
  ConversationEdgeCaseHandler,
  conversationEdgeCaseHandler,
} from './edge-case/conversation-edge-case-handler';

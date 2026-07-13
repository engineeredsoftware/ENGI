import { BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT } from '@bitcode/conversations';

// App-facing binding of the canonical Bitcode Terminal conversation system prompt.
export const BITCODE_TERMINAL_APP_SYSTEM_PROMPT =
  BITCODE_TERMINAL_CONVERSATION_SYSTEM_PROMPT.formatStructured();

/**
 * Token model for Conversations enhanced rich-text input.
 */
export interface ConversationsRichTextToken {
  id: string;
  type: 'evidence_document' | 'settle_delivery' | 'attachment' | 'source' | 'destination' | 'pipeline_run' | 'command';
  text: string;
  data: any;
  displayInfo?: string;
}

export interface ConversationsEnhancedRichTextInputProps {
  onSend: (message: string, tokens: ConversationsRichTextToken[]) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Enable Conversations pickers (^ @ + # !) – set to false for plain input mode
   */
  enablePickers?: boolean;
  className?: string;
  /**
   * When true, the textarea stretches to fill the height of its container so
   * callers can align it perfectly inside fixed-height flex rows.
   */
  fullHeight?: boolean;
  /**
   * Use minimal vertical padding so the overall height matches button-like
   * controls. Useful for compact instruction bars.
   */
  compact?: boolean;
  /**
   * Current conversation ID for OTF target picker defaults
   */
  currentConversationId?: string;
}

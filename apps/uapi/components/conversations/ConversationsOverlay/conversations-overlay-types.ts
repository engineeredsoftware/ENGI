/**
 * Conversations overlay props and conversation detail response types.
 */
import type {
  Conversation as DBConversation,
  ConversationMessage as DBMessage,
} from '@bitcode/conversations';

export type ConversationDetailResponse = DBConversation & {
  message_count?: number;
  attachment_count?: number;
  last_message?: string | null;
  messages?: Array<
    DBMessage & {
      message_attachments?: Array<Record<string, unknown>>;
    }
  >;
};

export interface ConversationsOverlayProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  inSidebar?: boolean;
  isOpen?: boolean;
  forceOpen?: boolean;
  forceFullscreen?: boolean;
  onToggle?: () => void;
  onCloseRequest?: () => void;
  showFloatingOrb?: boolean;
}

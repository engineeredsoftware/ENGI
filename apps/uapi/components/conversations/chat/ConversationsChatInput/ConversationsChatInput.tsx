"use client";

import React from 'react';
import ConversationsEnhancedRichTextInput from '@/components/conversations/ConversationsEnhancedRichTextInput/ConversationsEnhancedRichTextInput';

interface ConversationsChatInputProps {
  onSend: (text: string, tokens?: any[]) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  currentConversationId?: string;
  className?: string;
}

export default function ConversationsChatInput({
  onSend,
  disabled,
  placeholder,
  currentConversationId,
  className = '',
}: ConversationsChatInputProps) {
  return (
    <div className={`conversations-input ${className}`}>
      <ConversationsEnhancedRichTextInput
        onSend={onSend}
        currentConversationId={currentConversationId}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}

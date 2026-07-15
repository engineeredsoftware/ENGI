"use client";

import React from 'react';
import ConversationsMessageWaterfall from '@/components/conversations/ConversationsMessageWaterfall/ConversationsMessageWaterfall';

interface ConversationsChatMessagesProps {
  messages: any[];
  className?: string;
  containerRef?: React.Ref<HTMLDivElement>;
  embedProcessLogs?: boolean;
  processLogOutputDetails?: Record<string, any>;
  renderTokenInMessage?: (content: string, tokens?: any[]) => string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export default function ConversationsChatMessages({
  messages,
  className = '',
  containerRef,
  embedProcessLogs = true,
  processLogOutputDetails,
  renderTokenInMessage,
  onScroll,
}: ConversationsChatMessagesProps) {
  const renderMessageTokens = renderTokenInMessage ?? ((content: string) => content);

  return (
    <div ref={containerRef} className={`conversations-messages custom-scrollbar ${className}`} onScroll={onScroll}>
      <ConversationsMessageWaterfall
        messages={messages}
        renderTokenInMessage={renderMessageTokens}
        embedProcessLogs={embedProcessLogs}
        processLogOutputDetails={processLogOutputDetails}
      />
    </div>
  );
}

'use client';

import React from 'react';
interface PipelineRunPickerProps {
  isOpen: boolean;
  onSelect: (target: {
    id: string;
    title: string;
    type: 'output_destination';
    conversationId?: string;
  }) => void;
  onClose: () => void;
  searchTerm: string;
  currentConversationId?: string;
}

export default function PipelineRunPicker({
  isOpen,
  onSelect,
  onClose,
  searchTerm,
  currentConversationId,
}: PipelineRunPickerProps) {
  if (!isOpen) return null;

  const targetTitle = searchTerm.trim() || 'Current conversation';

  return (
    <div className="picker-container">
      <div className="picker-header">DESTINATIONS</div>
      <div
        className="picker-item"
        onClick={() => {
          onSelect({
            id: currentConversationId || 'conversation-current',
            title: targetTitle,
            type: 'output_destination',
            conversationId: currentConversationId,
          });
          onClose();
        }}
      >
        <div className="picker-item-title">{targetTitle}</div>
        <div className="picker-item-description">
          Route output back into the active conversation.
        </div>
      </div>
    </div>
  );
}

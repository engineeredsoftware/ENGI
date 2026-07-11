"use client";

import React from 'react';

interface SystemPromptSectionProps {
  value: string;
  onChange: (v: string) => void;
  tokenCount: number;
  updateTokenCounter: (v: string) => void;
}

export default function SystemPromptSection({ value, onChange, tokenCount, updateTokenCounter }: SystemPromptSectionProps) {
  return (
    <div className="system-prompt-section">
      <label htmlFor="globalSystemPrompt" className="form-label">Global System Prompt</label>
      <textarea
        id="globalSystemPrompt"
        className="form-textarea"
        value={value}
        onChange={(e) => { onChange(e.target.value); updateTokenCounter(e.target.value); }}
        rows={6}
        placeholder="Provide global guidance for all AI operations (optional)"
      />
      <div className="token-count">~{tokenCount} tokens</div>
    </div>
  );
}

"use client";

import React from 'react';

interface SystemPromptSectionProps {
  value: string;
  onChange: (v: string) => void;
  tokenCount: number;
  updateTokenCounter: (v: string) => void;
}

/**
 * Shared Read–Deposit system prompt field (Interfaces auxillary).
 * Square glass chrome — no rounded orbital form shells.
 */
export default function SystemPromptSection({
  value,
  onChange,
  tokenCount,
  updateTokenCounter,
}: SystemPromptSectionProps) {
  return (
    <div
      className="system-prompt-section auxillaries-glass-nested space-y-3 rounded-none border border-white/10 p-4"
      data-testid="auxillaries-shared-system-prompt"
    >
      <div className="space-y-1">
        <label
          htmlFor="globalSystemPrompt"
          className="block text-sm font-semibold text-white"
        >
          Shared system prompt
        </label>
        <p className="text-xs leading-6 text-white/58">
          One baseline instruction for both Read and Deposit AI work. Optional — leave empty
          to keep product defaults.
        </p>
      </div>
      <textarea
        id="globalSystemPrompt"
        className="min-h-[9rem] w-full resize-y rounded-none border border-emerald-300/25 bg-[rgba(7,15,28,0.55)] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/38 focus:border-emerald-300/55 focus:bg-[rgba(7,15,28,0.72)]"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          updateTokenCounter(e.target.value);
        }}
        rows={6}
        placeholder="Shared guidance for Read and Deposit (optional)"
      />
      <div className="text-xs tabular-nums text-white/48">~{tokenCount} tokens</div>
    </div>
  );
}

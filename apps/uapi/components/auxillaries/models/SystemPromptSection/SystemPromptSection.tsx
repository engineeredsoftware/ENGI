"use client";

import React from 'react';

interface SystemPromptSectionProps {
  value: string;
  onChange: (v: string) => void;
  tokenCount: number;
  updateTokenCounter: (v: string) => void;
  /** True when the draft differs from the last committed/saved value. */
  isDirty?: boolean;
  /** Persist the current draft (explicit Save). */
  onSave?: () => void;
  /** Revert the draft to the last committed value. */
  onUndo?: () => void;
  /** Disable Save while a write is in flight. */
  isSaving?: boolean;
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
  isDirty = false,
  onSave,
  onUndo,
  isSaving = false,
}: SystemPromptSectionProps) {
  const showActions = Boolean(onSave || onUndo);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs tabular-nums text-white/48">
          ~{tokenCount} tokens
          {isDirty ? (
            <span className="ml-2 text-amber-200/80">· unsaved edits</span>
          ) : null}
        </div>
        {showActions ? (
          <div className="flex flex-wrap items-center gap-2">
            {onUndo ? (
              <button
                type="button"
                data-testid="auxillaries-system-prompt-undo"
                disabled={!isDirty || isSaving}
                onClick={onUndo}
                className="inline-flex h-9 items-center justify-center rounded-none border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/78 transition hover:border-white/22 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Undo edits
              </button>
            ) : null}
            {onSave ? (
              <button
                type="button"
                data-testid="auxillaries-system-prompt-save"
                disabled={!isDirty || isSaving}
                onClick={onSave}
                className="inline-flex h-9 items-center justify-center rounded-none border border-emerald-300/35 bg-emerald-950/70 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-900/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

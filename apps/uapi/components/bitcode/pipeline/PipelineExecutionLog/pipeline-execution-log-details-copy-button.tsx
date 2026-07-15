'use client';

/**
 * Copy button for one expanded pipeline log line Details JSON.
 */

import React, { useState } from 'react';
import { CheckIcon, ClipboardCopyIcon } from '@radix-ui/react-icons';
import { copyTextToClipboard } from './pipeline-execution-log-clipboard';

export function DetailsCopyButton({ payload }: { payload: unknown }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy details JSON"
      aria-label="Copy details JSON"
      onClick={async (event) => {
        event.stopPropagation();
        const ok = await copyTextToClipboard(JSON.stringify(payload, null, 2));
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className="inline-flex h-5 w-5 items-center justify-center border border-white/10 bg-black/30 text-neutral-400 transition hover:border-emerald-300/40 hover:text-emerald-200 focus:outline-none"
    >
      {copied ? (
        <CheckIcon className="h-3 w-3 text-emerald-300" />
      ) : (
        <ClipboardCopyIcon className="h-3 w-3" />
      )}
    </button>
  );
}


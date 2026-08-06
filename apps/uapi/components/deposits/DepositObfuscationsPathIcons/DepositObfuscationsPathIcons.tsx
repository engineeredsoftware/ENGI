/**
 * Shared include/exclude path icons for the deposit Obfuscations surface.
 *
 * Used on the Permissible sources / Impermissible sources section headers and
 * again in the saved-anchors dropdown sub-text so both surfaces share one
 * visual language.
 */

import React from 'react';
import { FolderMinus, FolderPlus } from 'lucide-react';

import { normalizeObfuscationsAnchorPaths } from '@/components/bitcode/pipeline/models/pipeline-activity-history';

const ICON_CLASS = 'h-3.5 w-3.5 shrink-0';

/** Permissible sources affordance (emerald). */
export function DepositIncludePathsIcon({
  className,
  title = 'Permissible sources',
}: {
  className?: string;
  title?: string;
}) {
  // Lucide icons do not accept `title`; wrap so hover tooltips still work.
  return (
    <span title={title} className="inline-flex shrink-0">
      <FolderPlus
        className={className ?? `${ICON_CLASS} text-emerald-300/80`}
        aria-hidden="true"
      />
    </span>
  );
}

/** Impermissible sources affordance (rose). */
export function DepositExcludePathsIcon({
  className,
  title = 'Impermissible sources',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span title={title} className="inline-flex shrink-0">
      <FolderMinus
        className={className ?? `${ICON_CLASS} text-rose-300/80`}
        aria-hidden="true"
      />
    </span>
  );
}

export function clipObfuscationsAnchorText(
  text: string,
  textClipLength = 40,
): string {
  const clipAt = Math.max(8, textClipLength);
  const raw =
    typeof text === 'string' ? text.trim().replace(/\s+/g, ' ') : '';
  if (!raw) return '(empty)';
  return raw.length > clipAt ? `${raw.slice(0, clipAt).trimEnd()}…` : raw;
}

/**
 * Dropdown sub-text: clipped body | include-count icon | exclude-count icon.
 * Counts always present so the row is scannable; icons match the picker headers.
 */
export function ObfuscationsAnchorDescription({
  text,
  permissibleSources,
  impermissibleSources,
  textClipLength,
}: {
  text: string;
  permissibleSources?: string[] | null;
  impermissibleSources?: string[] | null;
  textClipLength?: number;
}) {
  const clipped = clipObfuscationsAnchorText(text, textClipLength);
  const hintCount = normalizeObfuscationsAnchorPaths(permissibleSources).length;
  const exclusionCount = normalizeObfuscationsAnchorPaths(
    impermissibleSources,
  ).length;
  const hintsAria = `${hintCount} path${hintCount === 1 ? '' : 's'} in permissible sources`;
  const exclusionsAria = `${exclusionCount} path${
    exclusionCount === 1 ? '' : 's'
  } in impermissible sources`;

  // Single line always: clipped body truncates; icon counts stay pinned on the right.
  return (
    <span className="flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap">
      <span className="min-w-0 truncate text-neutral-400" title={clipped}>
        {clipped}
      </span>
      <span className="shrink-0 text-neutral-600" aria-hidden="true">
        |
      </span>
      <span
        className="inline-flex shrink-0 items-center gap-0.5 text-neutral-300"
        aria-label={hintsAria}
        title={hintsAria}
      >
        <DepositIncludePathsIcon className="h-3 w-3 text-emerald-300/80" />
        <span className="tabular-nums">{hintCount}</span>
      </span>
      <span className="shrink-0 text-neutral-600" aria-hidden="true">
        |
      </span>
      <span
        className="inline-flex shrink-0 items-center gap-0.5 text-neutral-300"
        aria-label={exclusionsAria}
        title={exclusionsAria}
      >
        <DepositExcludePathsIcon className="h-3 w-3 text-rose-300/80" />
        <span className="tabular-nums">{exclusionCount}</span>
      </span>
    </span>
  );
}

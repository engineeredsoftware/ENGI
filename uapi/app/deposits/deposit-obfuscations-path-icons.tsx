/**
 * Shared include/exclude path icons for the deposit Obfuscations surface.
 *
 * Used on the Forced Inclusion / Forced Exclusions section headers and again
 * in the saved-anchors dropdown sub-text so the two surfaces share one visual
 * language.
 */

import React from 'react';
import { FolderMinus, FolderPlus } from 'lucide-react';

import { normalizeObfuscationsAnchorPaths } from '@/app/terminal/terminal-activity-history';

const ICON_CLASS = 'h-3.5 w-3.5 shrink-0';

/** Forced Inclusion affordance (emerald). */
export function DepositIncludePathsIcon({
  className,
  title = 'Forced Inclusion',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <FolderPlus
      className={className ?? `${ICON_CLASS} text-emerald-300/80`}
      aria-hidden="true"
      title={title}
    />
  );
}

/** Forced Exclusions affordance (rose). */
export function DepositExcludePathsIcon({
  className,
  title = 'Forced Exclusions',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <FolderMinus
      className={className ?? `${ICON_CLASS} text-rose-300/80`}
      aria-hidden="true"
      title={title}
    />
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
  sourcePathHints,
  protectedIpExclusions,
  textClipLength,
}: {
  text: string;
  sourcePathHints?: string[] | null;
  protectedIpExclusions?: string[] | null;
  textClipLength?: number;
}) {
  const clipped = clipObfuscationsAnchorText(text, textClipLength);
  const hintCount = normalizeObfuscationsAnchorPaths(sourcePathHints).length;
  const exclusionCount = normalizeObfuscationsAnchorPaths(
    protectedIpExclusions,
  ).length;
  const hintsAria = `${hintCount} forced inclusion ${
    hintCount === 1 ? 'path' : 'paths'
  }`;
  const exclusionsAria = `${exclusionCount} forced exclusion ${
    exclusionCount === 1 ? 'path' : 'paths'
  }`;

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

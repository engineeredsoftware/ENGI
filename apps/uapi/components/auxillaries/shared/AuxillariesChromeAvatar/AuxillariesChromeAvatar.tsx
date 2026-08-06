'use client';

/**
 * Auxillaries header avatar — replaces notifications chrome.
 * Opens Profile; shows current avatar_url (preset or custom upload).
 */

import React from 'react';

import {
  PROFILE_AVATAR_OPTIONS,
  toCssBackgroundImage,
} from '@/components/auxillaries/AuxillariesProfilePane/models/profile-pane-format';

export interface AuxillariesChromeAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  onOpenProfile?: () => void;
}

function resolveAvatarSrc(avatarUrl?: string | null): string {
  const trimmed = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';
  if (trimmed) return trimmed;
  return PROFILE_AVATAR_OPTIONS[0];
}

export default function AuxillariesChromeAvatar({
  avatarUrl = null,
  displayName = null,
  onOpenProfile,
}: AuxillariesChromeAvatarProps) {
  const src = resolveAvatarSrc(avatarUrl);
  const label = displayName?.trim() ? `Open profile (${displayName.trim()})` : 'Open profile';

  return (
    <button
      type="button"
      data-testid="auxillaries-chrome-avatar"
      data-auxillaries-testid="auxillaries-chrome-avatar"
      onClick={() => onOpenProfile?.()}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-none border border-emerald-300/30 bg-emerald-950/50 bg-cover bg-center transition hover:border-emerald-200/55 hover:bg-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/45"
      style={{ backgroundImage: toCssBackgroundImage(src) }}
    >
      <span className="sr-only">{label}</span>
    </button>
  );
}

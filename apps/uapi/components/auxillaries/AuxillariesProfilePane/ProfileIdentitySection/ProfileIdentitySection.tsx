/**
 * Identity metadata form (display name, handle, company, avatar, bio) plus role chips.
 */

import React, { useRef } from 'react';
import { PROFILE_AVATAR_OPTIONS, toCssBackgroundImage } from '../models/profile-pane-format';

const profileFieldClassName =
  'w-full rounded-none border border-emerald-300/25 bg-[rgba(7,15,28,0.55)] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/38 focus:border-emerald-300/55 focus:bg-[rgba(7,15,28,0.72)]';

export interface ProfileIdentitySectionProps {
  displayName: string;
  setDisplayName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  selectedAvatar: number;
  avatarUrl: string;
  selectAvatar: (index: number) => void;
  uploadCustomAvatar: (file: File | null | undefined) => void | Promise<void>;
  avatarError?: string | null;
  /** True when identity (or form) draft differs from last save. */
  isDirty?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onUndo?: () => void;
}

export default function ProfileIdentitySection({
  displayName,
  setDisplayName,
  username,
  setUsername,
  companyName,
  setCompanyName,
  bio,
  setBio,
  selectedAvatar,
  avatarUrl,
  selectAvatar,
  uploadCustomAvatar,
  avatarError = null,
  isDirty = false,
  isSaving = false,
  onSave,
  onUndo,
}: ProfileIdentitySectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isCustomAvatar =
    Boolean(avatarUrl) && !PROFILE_AVATAR_OPTIONS.includes(avatarUrl);
  const showActions = Boolean(onSave || onUndo);

  return (
    <>
      <section className="auxillaries-glass-card rounded-none border border-white/10 p-5">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
            Account profile
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">Identity and role metadata</h3>
        </div>

        <div className="grid gap-4 tablet:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className={profileFieldClassName}
              placeholder="Your name as seen by your team"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              Handle
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={profileFieldClassName}
              placeholder="Bitcode handle"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              Company
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className={profileFieldClassName}
              placeholder="Organization name"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/42">
              Role
            </label>
            <div className="relative">
              <input
                id="role"
                type="text"
                value="Admin"
                className={`${profileFieldClassName} cursor-not-allowed opacity-70`}
                disabled
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-none border border-emerald-300/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100/80">
                Default
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 tablet:grid-cols-[0.8fr_1.2fr]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              Avatar
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {PROFILE_AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={`avatar-preset-${index}`}
                  type="button"
                  onClick={() => selectAvatar(index)}
                  className={`h-12 w-12 shrink-0 rounded-none border bg-cover bg-center transition ${
                    selectedAvatar === index && !isCustomAvatar
                      ? 'border-emerald-300/60 ring-1 ring-emerald-300/35'
                      : 'border-white/12'
                  }`}
                  style={{ backgroundImage: toCssBackgroundImage(avatar) }}
                  aria-label={`Select avatar ${index + 1}`}
                  aria-pressed={selectedAvatar === index && !isCustomAvatar}
                />
              ))}
              {isCustomAvatar ? (
                <span
                  className="h-12 w-12 shrink-0 rounded-none border border-emerald-300/60 bg-cover bg-center"
                  style={{ backgroundImage: toCssBackgroundImage(avatarUrl) }}
                  title="Custom avatar"
                  aria-label="Custom avatar selected"
                />
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                data-testid="auxillaries-avatar-upload-input"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void uploadCustomAvatar(file);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                data-testid="auxillaries-avatar-upload-button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-none border border-emerald-300/28 bg-emerald-950/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-50 transition hover:border-emerald-200/45 hover:bg-emerald-900/50"
              >
                Upload photo
              </button>
              <p className="text-[11px] leading-5 text-white/48">
                Square glass chrome uses this avatar in the header.
              </p>
            </div>
            {avatarError ? (
              <p className="mt-2 text-xs text-red-300" data-testid="profile-avatar-error">
                {avatarError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              className={`${profileFieldClassName} min-h-[7rem] resize-y`}
              placeholder="Optional context for your team"
            />
          </div>
        </div>

        {showActions ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <p className="text-xs text-white/48">
              {isDirty ? (
                <span className="text-amber-200/80">Unsaved edits</span>
              ) : (
                <span>No unsaved identity changes</span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {onUndo ? (
                <button
                  type="button"
                  data-testid="auxillaries-profile-undo"
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
                  data-testid="auxillaries-profile-save"
                  disabled={!isDirty || isSaving}
                  onClick={onSave}
                  className="inline-flex h-9 items-center justify-center rounded-none border border-emerald-300/35 bg-emerald-950/70 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-900/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

/**
 * Identity metadata form (display name, handle, company, avatar, bio) plus role chips.
 */

import React, { useRef } from 'react';
import { PROFILE_AVATAR_OPTIONS } from '../models/profile-pane-format';

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
}: ProfileIdentitySectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isCustomAvatar =
    Boolean(avatarUrl) && !PROFILE_AVATAR_OPTIONS.includes(avatarUrl);

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
                  key={avatar}
                  type="button"
                  onClick={() => selectAvatar(index)}
                  className={`h-12 w-12 rounded-none border bg-cover bg-center transition ${
                    selectedAvatar === index && !isCustomAvatar
                      ? 'border-emerald-300/60'
                      : 'border-white/12'
                  }`}
                  style={{ backgroundImage: `url(${avatar})` }}
                  aria-label={`Select avatar ${index + 1}`}
                />
              ))}
              {isCustomAvatar ? (
                <span
                  className="h-12 w-12 rounded-none border border-emerald-300/60 bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarUrl})` }}
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
      </section>
    </>
  );
}

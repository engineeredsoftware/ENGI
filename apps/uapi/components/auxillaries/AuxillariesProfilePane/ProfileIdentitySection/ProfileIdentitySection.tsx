/**
 * Identity metadata form (display name, handle, company, avatar, bio) plus role chips.
 */

import React from 'react';
import type { ProfileTeamMember } from '../AuxillariesProfilePane.types';
import { PROFILE_AVATAR_OPTIONS } from '../models/profile-pane-format';

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
  selectAvatar: (index: number) => void;
  teamMembers: ProfileTeamMember[];
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
  selectAvatar,
  teamMembers,
}: ProfileIdentitySectionProps) {
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
          <div className="form-group">
            <label htmlFor="displayName" className="form-label">Display Name</label>
            <div className="orbitals-users-input-container enterprise">
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="form-input"
                placeholder="Your name as seen by your team"
              />
              <div className="input-focus-indicator"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Handle</label>
            <div className="orbitals-users-input-container enterprise">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="form-input"
                placeholder="Bitcode handle"
              />
              <div className="input-focus-indicator"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="companyName" className="form-label">Company</label>
            <div className="orbitals-users-input-container enterprise">
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="form-input"
                placeholder="Organization name"
              />
              <div className="input-focus-indicator"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label disabled-label">Role</label>
            <div className="orbitals-users-input-container role-container mt-1">
              <input id="role" type="text" value="Admin" className="form-input role-input" disabled />
              <div className="role-badge">Default</div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 tablet:grid-cols-[0.8fr_1.2fr]">
          <div>
            <label className="form-label">Avatar</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROFILE_AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => selectAvatar(index)}
                  className={`h-12 w-12 rounded-none border bg-cover bg-center transition ${
                    selectedAvatar === index ? 'border-emerald-300/60' : 'border-white/12'
                  }`}
                  style={{ backgroundImage: `url(${avatar})` }}
                  aria-label={`Select avatar ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">Bio</label>
            <div className="orbitals-users-input-container enterprise">
              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="form-input min-h-[7rem]"
                placeholder="Optional context for your team"
              />
              <div className="input-focus-indicator"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="auxillaries-glass-card mt-5 rounded-none border border-white/10 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
          Organization role posture
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {teamMembers.map((member) => (
            <span
              key={`${member.id}-${member.role}`}
              className="rounded-none border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/74"
            >
              {member.displayName || member.username || 'member'} · {member.role}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

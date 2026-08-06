/**
 * Organization team view — full roster for every member; invite/remove for admins.
 *
 * Invite uses type=button (not nested form submit) so the outer profile form cannot
 * capture the click and navigate/close the auxillary surface.
 */

'use client';

import React, { useMemo, useState } from 'react';

import type { ProfileTeamMember } from '../AuxillariesProfilePane.types';
import { PROFILE_AVATAR_OPTIONS, toCssBackgroundImage } from '../models/profile-pane-format';

const INVITE_ROLES: Array<ProfileTeamMember['role']> = ['admin', 'lead', 'dev'];

export interface ProfileTeamViewSectionProps {
  teamMembers: ProfileTeamMember[];
  currentUsername: string;
  currentRole: ProfileTeamMember['role'];
  canManageTeam: boolean;
  onInvite: (input: {
    username: string;
    displayName: string;
    role: ProfileTeamMember['role'];
  }) => Promise<
    | { ok: true; emailSent: boolean; emailSkippedReason: string | null; smtpConfigured: boolean }
    | { ok: false; error: string }
  >;
  onRemove: (memberId: string) => { ok: true } | { ok: false; error: string };
  onChangeRole: (
    memberId: string,
    role: ProfileTeamMember['role'],
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

function roleLabel(role: ProfileTeamMember['role']): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function statusLabel(status?: ProfileTeamMember['status']): string {
  if (status === 'invited') return 'Invited';
  return 'Active';
}

export default function ProfileTeamViewSection({
  teamMembers,
  currentUsername,
  currentRole,
  canManageTeam,
  onInvite,
  onRemove,
  onChangeRole,
}: ProfileTeamViewSectionProps) {
  const [inviteHandle, setInviteHandle] = useState('');
  const [inviteDisplayName, setInviteDisplayName] = useState('');
  const [inviteRole, setInviteRole] = useState<ProfileTeamMember['role']>('dev');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamNotice, setTeamNotice] = useState<string | null>(null);

  const sortedMembers = useMemo(() => {
    const rank: Record<ProfileTeamMember['role'], number> = {
      owner: 0,
      admin: 1,
      lead: 2,
      dev: 3,
    };
    return [...teamMembers].sort((a, b) => {
      const roleDelta = rank[a.role] - rank[b.role];
      if (roleDelta !== 0) return roleDelta;
      return (a.displayName || a.username).localeCompare(b.displayName || b.username);
    });
  }, [teamMembers]);

  const handleInvite = async () => {
    if (inviteBusy) return;
    setTeamError(null);
    setTeamNotice(null);
    setInviteBusy(true);
    try {
      const result = await onInvite({
        username: inviteHandle,
        displayName: inviteDisplayName,
        role: inviteRole,
      });
      if (!result.ok) {
        setTeamError(result.error);
        return;
      }
      setInviteHandle('');
      setInviteDisplayName('');
      setInviteRole('dev');
      if (result.emailSent) {
        setTeamNotice('Invite sent. They are on the roster as Invited.');
      } else if (!result.smtpConfigured && inviteHandle.includes('@')) {
        setTeamNotice(
          'Invite saved to the roster, but email delivery is not configured (EMAIL_SMTP_URL). No message was sent.',
        );
      } else if (result.emailSkippedReason) {
        setTeamNotice(`Invite saved to the roster. ${result.emailSkippedReason}`);
      } else {
        setTeamNotice('Invite saved to the team roster.');
      }
    } finally {
      setInviteBusy(false);
    }
  };

  return (
    <section
      className="auxillaries-glass-card mt-5 rounded-none border border-white/10 p-5"
      data-testid="auxillaries-profile-team-view"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
            Team
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">Organization team</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/64">
            Every member can see the full team. Owners and admins can invite, change roles, or
            remove people. Your role: <span className="text-white/88">{roleLabel(currentRole)}</span>
            {currentUsername ? (
              <>
                {' '}
                · <span className="font-mono text-[12px] text-white/72">{currentUsername}</span>
              </>
            ) : null}
          </p>
        </div>
        <span className="rounded-none border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-none border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] font-semibold uppercase tracking-[0.16em] text-white/52">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Member</th>
              <th className="px-3 py-2.5 font-semibold">Role</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              {canManageTeam ? (
                <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member) => {
              const isSelf =
                member.username.trim().toLowerCase() === currentUsername.trim().toLowerCase() ||
                member.id === '1';
              const canEditRole =
                canManageTeam &&
                !isSelf &&
                member.role !== 'owner' &&
                !(currentRole === 'admin' && member.role === 'admin');
              const canRemoveThis = canEditRole;

              return (
                <tr
                  key={member.id}
                  className="border-b border-white/8 last:border-b-0"
                  data-testid="auxillaries-team-member-row"
                  data-member-id={member.id}
                >
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-9 w-9 shrink-0 rounded-none border border-white/12 bg-cover bg-center"
                        style={{
                          backgroundImage: toCssBackgroundImage(
                            member.avatarUrl || PROFILE_AVATAR_OPTIONS[0],
                          ),
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {member.displayName || member.username || 'Member'}
                          {isSelf ? (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200/75">
                              You
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate font-mono text-[12px] text-white/52">
                          {member.username || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {canEditRole ? (
                      <select
                        aria-label={`Role for ${member.displayName || member.username}`}
                        data-testid="auxillaries-team-role-select"
                        value={member.role === 'owner' ? 'admin' : member.role}
                        disabled={roleBusyId === member.id}
                        onChange={(event) => {
                          const nextRole = event.target.value as ProfileTeamMember['role'];
                          if (nextRole === member.role) return;
                          setTeamError(null);
                          setTeamNotice(null);
                          setRoleBusyId(member.id);
                          void onChangeRole(member.id, nextRole).then((result) => {
                            setRoleBusyId(null);
                            if (!result.ok) setTeamError(result.error);
                            else
                              setTeamNotice(
                                `Updated ${member.displayName || member.username} to ${roleLabel(nextRole)}.`,
                              );
                          });
                        }}
                        className="rounded-none border border-emerald-300/28 bg-[rgba(7,15,28,0.75)] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white outline-none focus:border-emerald-300/50 disabled:opacity-50"
                      >
                        {INVITE_ROLES.map((role) => (
                          <option key={role} value={role} className="bg-slate-900 text-white">
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-none border border-white/12 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/78">
                        {roleLabel(member.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-white/70">{statusLabel(member.status)}</td>
                  {canManageTeam ? (
                    <td className="px-3 py-3 text-right">
                      {canRemoveThis ? (
                        <button
                          type="button"
                          data-testid="auxillaries-team-remove"
                          onClick={() => {
                            setTeamError(null);
                            setTeamNotice(null);
                            const result = onRemove(member.id);
                            if (!result.ok) setTeamError(result.error);
                            else setTeamNotice('Member removed from the team roster.');
                          }}
                          className="rounded-none border border-red-300/28 bg-red-950/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200/40 hover:bg-red-900/45"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/36">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canManageTeam ? (
        <div
          className="mt-5 space-y-3 rounded-none border border-emerald-300/18 bg-emerald-400/[0.04] p-4"
          data-testid="auxillaries-team-invite-form"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/72">
              Invite member
            </p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Use an email address to send an invite notification. Handle-only invites are rostered
              without email.
            </p>
          </div>
          <div className="grid gap-3 tablet:grid-cols-[1.1fr_1.1fr_0.7fr_auto]">
            <input
              type="text"
              value={inviteHandle}
              onChange={(event) => setInviteHandle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleInvite();
                }
              }}
              placeholder="email@company.com"
              aria-label="Invite email or handle"
              disabled={inviteBusy}
              className="w-full rounded-none border border-emerald-300/25 bg-[rgba(7,15,28,0.55)] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/38 focus:border-emerald-300/55 disabled:opacity-60"
              data-testid="auxillaries-team-invite-handle"
            />
            <input
              type="text"
              value={inviteDisplayName}
              onChange={(event) => setInviteDisplayName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleInvite();
                }
              }}
              placeholder="Display name (optional)"
              aria-label="Invite display name"
              disabled={inviteBusy}
              className="w-full rounded-none border border-emerald-300/25 bg-[rgba(7,15,28,0.55)] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/38 focus:border-emerald-300/55 disabled:opacity-60"
            />
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as ProfileTeamMember['role'])}
              aria-label="Invite role"
              disabled={inviteBusy}
              className="w-full rounded-none border border-emerald-300/25 bg-[rgba(7,15,28,0.55)] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-300/55 disabled:opacity-60"
              data-testid="auxillaries-team-invite-role"
            >
              {INVITE_ROLES.map((role) => (
                <option key={role} value={role} className="bg-slate-900 text-white">
                  {roleLabel(role)}
                </option>
              ))}
            </select>
            <button
              type="button"
              data-testid="auxillaries-team-invite-submit"
              onClick={() => void handleInvite()}
              disabled={inviteBusy}
              className="inline-flex min-w-[6.5rem] items-center justify-center rounded-none border border-emerald-300/35 bg-emerald-950/55 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-900/60 disabled:cursor-wait disabled:opacity-60"
            >
              {inviteBusy ? 'Sending…' : 'Invite'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs leading-6 text-white/48">
          You can view the full team. Ask an owner or admin to invite or remove members.
        </p>
      )}

      {teamError ? (
        <p className="mt-3 text-xs text-red-300" data-testid="auxillaries-team-error" role="alert">
          {teamError}
        </p>
      ) : null}
      {teamNotice ? (
        <p
          className="mt-3 text-xs text-emerald-200/80"
          data-testid="auxillaries-team-notice"
          role="status"
        >
          {teamNotice}
        </p>
      ) : null}
    </section>
  );
}

/**
 * Profile form state, initial-prop sync, team-member projection, and explicit
 * Save / Undo (no silent autosave on identity or preference edits).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@bitcode/supabase/ssr/client';
import {
  DEFAULT_EMAIL_NOTIFICATION_PREFERENCES,
  type BitcodeEmailNotificationPreferences,
} from '@bitcode/orm';

import type {
  AuxillariesProfilePaneProps,
  ProfileTeamMember,
  SupabaseAuthSession,
} from '../AuxillariesProfilePane.types';
import {
  indexOfProfileAvatar,
  PROFILE_AVATAR_OPTIONS,
  readImageFileAsAvatarDataUrl,
} from '../models/profile-pane-format';

type ProfileIdentityCommit = {
  username: string;
  displayName: string;
  bio: string;
  companyName: string;
  avatarUrl: string;
  selectedAvatar: number;
  emailNotificationPreferences: BitcodeEmailNotificationPreferences;
  teamMembers: ProfileTeamMember[];
  isVerified: boolean;
  email: string;
};

type ProfileFormArgs = Pick<
  AuxillariesProfilePaneProps,
  | 'onSave'
  | 'loading'
  | 'initialTeamMembers'
  | 'initialUsername'
  | 'initialDisplayName'
  | 'initialBio'
  | 'initialCompanyName'
  | 'initialAvatarUrl'
  | 'initialEmail'
  | 'initialIsVerified'
  | 'initialEmailNotificationPreferences'
  | 'isOnboardingComplete'
  | 'onCompletionStatusChange'
>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : value == null ? fallback : String(value);
}

const FALLBACK_EMAIL_PREFERENCES: BitcodeEmailNotificationPreferences = {
  receiveProductUpdates: false,
  receiveYourNotifications: false,
  receiveCriticalUpdates: true,
};

function normalizeEmailPreferences(
  value: unknown,
): BitcodeEmailNotificationPreferences {
  const defaults = DEFAULT_EMAIL_NOTIFICATION_PREFERENCES ?? FALLBACK_EMAIL_PREFERENCES;
  const record =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  return {
    receiveProductUpdates: Boolean(
      record?.receiveProductUpdates ?? defaults.receiveProductUpdates ?? false,
    ),
    receiveYourNotifications: Boolean(
      record?.receiveYourNotifications ?? defaults.receiveYourNotifications ?? false,
    ),
    receiveCriticalUpdates: true,
  };
}

function normalizeTeamMembers(
  value: unknown,
  fallback: ProfileTeamMember[],
): ProfileTeamMember[] {
  return Array.isArray(value) && value.length > 0
    ? (value as ProfileTeamMember[])
    : fallback;
}

export function useProfilePaneForm({
  onSave,
  loading: _loading,
  initialTeamMembers = [],
  initialUsername = '',
  initialDisplayName = '',
  initialBio = '',
  initialCompanyName = '',
  initialAvatarUrl = '',
  initialEmail = '',
  initialIsVerified = false,
  initialEmailNotificationPreferences,
  isOnboardingComplete: _isOnboardingComplete = false,
  onCompletionStatusChange,
}: ProfileFormArgs) {
  const safeUsername = asString(initialUsername);
  const safeDisplayName = asString(initialDisplayName);
  const safeBio = asString(initialBio);
  const safeCompanyName = asString(initialCompanyName);
  const safeAvatarUrl = asString(initialAvatarUrl) || PROFILE_AVATAR_OPTIONS[0];
  const safeSelectedAvatar = indexOfProfileAvatar(safeAvatarUrl);
  const safeEmail = asString(initialEmail);
  const defaultSelfMember: ProfileTeamMember = {
    id: '1',
    username: safeUsername || 'current_user',
    displayName: safeDisplayName || 'Current User',
    avatarUrl: safeAvatarUrl,
    role: 'admin',
    status: 'accepted',
    btcFeeBudget: 50000,
  };

  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState(safeEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(Boolean(initialIsVerified));
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [username, setUsername] = useState(safeUsername);
  const [displayName, setDisplayName] = useState(safeDisplayName);
  const [bio, setBio] = useState(safeBio);
  const [companyName, setCompanyName] = useState(safeCompanyName);
  const [selectedAvatar, setSelectedAvatar] = useState(safeSelectedAvatar);
  const [avatarUrl, setAvatarUrl] = useState(safeAvatarUrl);
  const [teamMembers, setTeamMembers] = useState<ProfileTeamMember[]>(() =>
    normalizeTeamMembers(initialTeamMembers, [defaultSelfMember]),
  );
  const [emailNotificationPreferences, setEmailNotificationPreferences] =
    useState<BitcodeEmailNotificationPreferences>(() =>
      normalizeEmailPreferences(initialEmailNotificationPreferences),
    );
  const verifiedRef = useRef<boolean>(initialIsVerified);
  const isProfileDirtyRef = useRef(false);

  const buildCommitSnapshot = useCallback(
    (partial?: Partial<ProfileIdentityCommit>): ProfileIdentityCommit => ({
      username,
      displayName,
      bio,
      companyName,
      avatarUrl: avatarUrl || PROFILE_AVATAR_OPTIONS[selectedAvatar],
      selectedAvatar,
      emailNotificationPreferences: {
        ...emailNotificationPreferences,
        receiveCriticalUpdates: true,
      },
      teamMembers,
      isVerified,
      email,
      ...partial,
    }),
    [
      avatarUrl,
      bio,
      companyName,
      displayName,
      email,
      emailNotificationPreferences,
      isVerified,
      selectedAvatar,
      teamMembers,
      username,
    ],
  );

  const [committed, setCommitted] = useState<ProfileIdentityCommit>(() => ({
    username: safeUsername,
    displayName: safeDisplayName,
    bio: safeBio,
    companyName: safeCompanyName,
    avatarUrl: safeAvatarUrl,
    selectedAvatar: safeSelectedAvatar,
    emailNotificationPreferences: normalizeEmailPreferences(
      initialEmailNotificationPreferences,
    ),
    teamMembers: normalizeTeamMembers(initialTeamMembers, [defaultSelfMember]),
    isVerified: Boolean(initialIsVerified),
    email: safeEmail,
  }));
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    onCompletionStatusChange?.(true);
  }, [onCompletionStatusChange]);

  /** Apply remote/auth identity only when the local draft is clean. */
  const adoptRemoteIfClean = useCallback(
    (patch: Partial<ProfileIdentityCommit> & Record<string, unknown>) => {
      if (isProfileDirtyRef.current) return;
      if (typeof patch.email === 'string') setEmail(asString(patch.email));
      if (typeof patch.isVerified === 'boolean') {
        setIsVerified(patch.isVerified);
        verifiedRef.current = patch.isVerified;
      }
      if (typeof patch.username === 'string') setUsername(asString(patch.username));
      if (typeof patch.displayName === 'string') setDisplayName(asString(patch.displayName));
      if (typeof patch.bio === 'string') setBio(asString(patch.bio));
      if (typeof patch.companyName === 'string') setCompanyName(asString(patch.companyName));
      if (typeof patch.avatarUrl === 'string') {
        const nextUrl = asString(patch.avatarUrl) || PROFILE_AVATAR_OPTIONS[0];
        setAvatarUrl(nextUrl);
        if (typeof patch.selectedAvatar !== 'number') {
          setSelectedAvatar(indexOfProfileAvatar(nextUrl));
        }
      }
      if (typeof patch.selectedAvatar === 'number') setSelectedAvatar(patch.selectedAvatar);
      if (patch.emailNotificationPreferences) {
        setEmailNotificationPreferences(
          normalizeEmailPreferences(patch.emailNotificationPreferences),
        );
      }
      if (Array.isArray(patch.teamMembers) && patch.teamMembers.length > 0) {
        setTeamMembers(patch.teamMembers as ProfileTeamMember[]);
      }
      setCommitted((prev) => ({
        ...prev,
        ...patch,
        email:
          typeof patch.email === 'string' ? asString(patch.email) : prev.email,
        username:
          typeof patch.username === 'string' ? asString(patch.username) : prev.username,
        displayName:
          typeof patch.displayName === 'string'
            ? asString(patch.displayName)
            : prev.displayName,
        bio: typeof patch.bio === 'string' ? asString(patch.bio) : prev.bio,
        companyName:
          typeof patch.companyName === 'string'
            ? asString(patch.companyName)
            : prev.companyName,
        avatarUrl:
          typeof patch.avatarUrl === 'string'
            ? asString(patch.avatarUrl) || PROFILE_AVATAR_OPTIONS[0]
            : prev.avatarUrl,
        emailNotificationPreferences: patch.emailNotificationPreferences
          ? normalizeEmailPreferences(patch.emailNotificationPreferences)
          : prev.emailNotificationPreferences,
      }));
    },
    [],
  );

  useEffect(() => {
    adoptRemoteIfClean({ email: asString(initialEmail) });
  }, [adoptRemoteIfClean, initialEmail]);

  useEffect(() => {
    adoptRemoteIfClean({ isVerified: Boolean(initialIsVerified) });
  }, [adoptRemoteIfClean, initialIsVerified]);

  useEffect(() => {
    adoptRemoteIfClean({
      emailNotificationPreferences: normalizeEmailPreferences(
        initialEmailNotificationPreferences,
      ),
    });
  }, [adoptRemoteIfClean, initialEmailNotificationPreferences]);

  useEffect(() => {
    adoptRemoteIfClean({ username: asString(initialUsername) });
  }, [adoptRemoteIfClean, initialUsername]);

  useEffect(() => {
    adoptRemoteIfClean({ displayName: asString(initialDisplayName) });
  }, [adoptRemoteIfClean, initialDisplayName]);

  useEffect(() => {
    adoptRemoteIfClean({ bio: asString(initialBio) });
  }, [adoptRemoteIfClean, initialBio]);

  useEffect(() => {
    adoptRemoteIfClean({ companyName: asString(initialCompanyName) });
  }, [adoptRemoteIfClean, initialCompanyName]);

  useEffect(() => {
    adoptRemoteIfClean({
      avatarUrl: asString(initialAvatarUrl) || PROFILE_AVATAR_OPTIONS[0],
    });
  }, [adoptRemoteIfClean, initialAvatarUrl]);

  useEffect(() => {
    if (!Array.isArray(initialTeamMembers) || initialTeamMembers.length === 0) return;
    adoptRemoteIfClean({ teamMembers: initialTeamMembers });
  }, [adoptRemoteIfClean, initialTeamMembers]);

  useEffect(() => {
    const supabase = createClient();

    const syncFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user?.email) {
        const next: Partial<ProfileIdentityCommit> = { email: user.email };
        if (!verifiedRef.current) {
          next.isVerified = true;
        }
        adoptRemoteIfClean(next);
      }
    };

    syncFromSession().catch(() => {});

    const msgHandler = (event: MessageEvent) => {
      if (
        event.data?.type === 'oauth-connect-complete' ||
        event.data?.type === 'oauth-login-complete'
      ) {
        syncFromSession();
      }
    };
    window.addEventListener('message', msgHandler);

    const { data: listener } = supabase.auth.onAuthStateChange((_event: unknown, session: SupabaseAuthSession) => {
      if (session?.user?.email) {
        const next: Partial<ProfileIdentityCommit> = { email: session.user.email };
        if (!verifiedRef.current) {
          next.isVerified = true;
        }
        adoptRemoteIfClean(next);
      }
    });

    return () => {
      window.removeEventListener('message', msgHandler);
      listener.subscription.unsubscribe();
    };
  }, [adoptRemoteIfClean]);

  // Mirror identity draft onto the self team row (any team size — was length===1 only).
  useEffect(() => {
    const nextAvatar =
      avatarUrl ||
      (selectedAvatar >= 0 ? PROFILE_AVATAR_OPTIONS[selectedAvatar] : '') ||
      PROFILE_AVATAR_OPTIONS[0];
    const handle = asString(username).trim().toLowerCase();

    setTeamMembers((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((member, index) => {
        const isSelf =
          member.id === '1' ||
          (handle.length > 0 &&
            asString(member.username).trim().toLowerCase() === handle) ||
          (index === 0 &&
            !prev.some(
              (entry) =>
                entry.id === '1' ||
                (handle.length > 0 &&
                  asString(entry.username).trim().toLowerCase() === handle),
            ));
        if (!isSelf) return member;
        const nextUsername = username || member.username;
        const nextDisplayName = displayName || member.displayName;
        if (
          member.username === nextUsername &&
          member.displayName === nextDisplayName &&
          member.avatarUrl === nextAvatar
        ) {
          return member;
        }
        changed = true;
        return {
          ...member,
          username: nextUsername,
          displayName: nextDisplayName,
          avatarUrl: nextAvatar,
        };
      });
      return changed ? next : prev;
    });
  }, [avatarUrl, displayName, selectedAvatar, username]);

  const profileAutosavePayload = useMemo(
    () => ({
      username,
      displayName,
      bio,
      companyName,
      avatarUrl: avatarUrl || PROFILE_AVATAR_OPTIONS[selectedAvatar],
      teamMembers,
      isVerified,
      email: email || null,
      emailNotificationPreferences: {
        ...emailNotificationPreferences,
        receiveCriticalUpdates: true,
      },
    }),
    [
      avatarUrl,
      bio,
      companyName,
      displayName,
      email,
      emailNotificationPreferences,
      isVerified,
      selectedAvatar,
      teamMembers,
      username,
    ],
  );

  const isProfileDirty = useMemo(() => {
    const draft = buildCommitSnapshot();
    return JSON.stringify(draft) !== JSON.stringify(committed);
  }, [buildCommitSnapshot, committed]);
  isProfileDirtyRef.current = isProfileDirty;

  const currentTeamMember = useMemo(() => {
    const handle = asString(username).trim().toLowerCase();
    return (
      teamMembers.find(
        (member) => asString(member.username).trim().toLowerCase() === handle,
      ) ??
      teamMembers[0] ??
      null
    );
  }, [teamMembers, username]);

  const currentRole: ProfileTeamMember['role'] = currentTeamMember?.role ?? 'admin';
  const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

  const inviteTeamMember = async (input: {
    username: string;
    displayName: string;
    role: ProfileTeamMember['role'];
  }): Promise<
    | { ok: true; emailSent: boolean; emailSkippedReason: string | null; smtpConfigured: boolean }
    | { ok: false; error: string }
  > => {
    if (!canManageTeam) {
      return { ok: false, error: 'Only owners and admins can invite team members.' };
    }
    const handle = input.username.trim().toLowerCase().replace(/^@/, '');
    if (!handle) {
      return { ok: false, error: 'Enter a handle or email to invite.' };
    }
    if (teamMembers.some((member) => member.username.trim().toLowerCase() === handle)) {
      return { ok: false, error: 'That person is already on the team roster.' };
    }
    if (input.role === 'owner') {
      return { ok: false, error: 'Owner role cannot be assigned via invite.' };
    }

    try {
      const response = await fetch('/api/auxillaries/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: handle,
          displayName: input.displayName.trim() || handle,
          role: input.role,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        member?: ProfileTeamMember;
        emailSent?: boolean;
        emailSkippedReason?: string | null;
        smtpConfigured?: boolean;
      };

      if (!response.ok) {
        return { ok: false, error: data.error || 'Invite failed.' };
      }

      const member: ProfileTeamMember = data.member
        ? {
            ...data.member,
            avatarUrl:
              data.member.avatarUrl ||
              PROFILE_AVATAR_OPTIONS[teamMembers.length % PROFILE_AVATAR_OPTIONS.length],
          }
        : {
            id: `invite-${Date.now()}`,
            username: handle,
            displayName: input.displayName.trim() || handle,
            avatarUrl: PROFILE_AVATAR_OPTIONS[teamMembers.length % PROFILE_AVATAR_OPTIONS.length],
            role: input.role,
            status: 'invited',
          };

      // Server already persisted the roster — keep draft + commit in sync.
      setTeamMembers((members) => {
        const next = [...members, member];
        setCommitted((prev) => ({ ...prev, teamMembers: next }));
        return next;
      });

      return {
        ok: true,
        emailSent: Boolean(data.emailSent),
        emailSkippedReason: data.emailSkippedReason ?? null,
        smtpConfigured: Boolean(data.smtpConfigured),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Invite failed.',
      };
    }
  };

  const removeTeamMember = (
    memberId: string,
  ): { ok: true } | { ok: false; error: string } => {
    if (!canManageTeam) {
      return { ok: false, error: 'Only owners and admins can remove team members.' };
    }
    const target = teamMembers.find((member) => member.id === memberId);
    if (!target) {
      return { ok: false, error: 'Member not found.' };
    }
    if (target.role === 'owner') {
      return { ok: false, error: 'The organization owner cannot be removed here.' };
    }
    if (currentRole === 'admin' && target.role === 'admin') {
      return { ok: false, error: 'Admins cannot remove other admins.' };
    }
    const selfHandle = username.trim().toLowerCase();
    if (target.username.trim().toLowerCase() === selfHandle || target.id === '1') {
      return { ok: false, error: 'You cannot remove yourself from the team.' };
    }
    setTeamMembers((members) => {
      const next = members.filter((member) => member.id !== memberId);
      setCommitted((prev) => ({ ...prev, teamMembers: next }));
      return next;
    });
    return { ok: true };
  };

  const changeTeamMemberRole = async (
    memberId: string,
    role: ProfileTeamMember['role'],
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!canManageTeam) {
      return { ok: false, error: 'Only owners and admins can change roles.' };
    }
    const target = teamMembers.find((member) => member.id === memberId);
    if (!target) {
      return { ok: false, error: 'Member not found.' };
    }
    if (target.role === 'owner' || memberId === '1') {
      return { ok: false, error: 'The organization owner role cannot be changed here.' };
    }
    if (currentRole === 'admin' && target.role === 'admin') {
      return { ok: false, error: 'Admins cannot change other admins.' };
    }
    if (role === 'owner') {
      return { ok: false, error: 'Owner role cannot be assigned here.' };
    }

    try {
      const response = await fetch('/api/auxillaries/team/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        member?: ProfileTeamMember;
      };
      if (!response.ok) {
        return { ok: false, error: data.error || 'Failed to update role.' };
      }

      setTeamMembers((members) => {
        const next = members.map((member) =>
          member.id === memberId
            ? {
                ...member,
                role: (data.member?.role as ProfileTeamMember['role']) || role,
              }
            : member,
        );
        setCommitted((prev) => ({ ...prev, teamMembers: next }));
        return next;
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update role.',
      };
    }
  };

  const selectAvatar = (index: number) => {
    setSelectedAvatar(index);
    setAvatarUrl(PROFILE_AVATAR_OPTIONS[index]);
    setAuthError(null);
  };

  const uploadCustomAvatar = async (file: File | null | undefined) => {
    if (!file) return;
    try {
      setAuthError(null);
      const dataUrl = await readImageFileAsAvatarDataUrl(file);
      setSelectedAvatar(-1);
      setAvatarUrl(dataUrl);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not upload avatar.');
    }
  };

  const handleSaveProfile = useCallback(() => {
    setIsSavingProfile(true);
    try {
      onSave(profileAutosavePayload);
      setCommitted(buildCommitSnapshot());
    } finally {
      setIsSavingProfile(false);
    }
  }, [buildCommitSnapshot, onSave, profileAutosavePayload]);

  const handleUndoProfile = useCallback(() => {
    setUsername(committed.username);
    setDisplayName(committed.displayName);
    setBio(committed.bio);
    setCompanyName(committed.companyName);
    setAvatarUrl(committed.avatarUrl);
    setSelectedAvatar(committed.selectedAvatar);
    setEmailNotificationPreferences({
      ...DEFAULT_EMAIL_NOTIFICATION_PREFERENCES,
      ...committed.emailNotificationPreferences,
      receiveCriticalUpdates: true,
    });
    setTeamMembers(committed.teamMembers);
    setEmail(committed.email);
    setIsVerified(committed.isVerified);
    verifiedRef.current = committed.isVerified;
  }, [committed]);

  /** After email verify / other external onSave — align commit to current draft. */
  const markProfileCommitted = useCallback(
    (override?: Partial<ProfileIdentityCommit>) => {
      setCommitted(buildCommitSnapshot(override));
    },
    [buildCommitSnapshot],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSaveProfile();
  };

  return {
    authError,
    setAuthError,
    email,
    setEmail,
    verificationCode,
    setVerificationCode,
    isVerifying,
    setIsVerifying,
    isVerified,
    setIsVerified,
    verificationLoading,
    setVerificationLoading,
    username,
    setUsername,
    displayName,
    setDisplayName,
    bio,
    setBio,
    companyName,
    setCompanyName,
    selectedAvatar,
    avatarUrl,
    teamMembers,
    currentRole,
    canManageTeam,
    profileAutosavePayload,
    verifiedRef,
    selectAvatar,
    uploadCustomAvatar,
    emailNotificationPreferences,
    setEmailNotificationPreferences,
    inviteTeamMember,
    removeTeamMember,
    changeTeamMemberRole,
    handleSubmit,
    isProfileDirty,
    isSavingProfile,
    handleSaveProfile,
    handleUndoProfile,
    markProfileCommitted,
  };
}

/**
 * Profile form state, initial-prop sync, team-member projection, and debounced autosave.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@bitcode/supabase/ssr/client';

import type {
  AuxillariesProfilePaneProps,
  ProfileTeamMember,
  SupabaseAuthSession,
} from '../AuxillariesProfilePane.types';
import {
  PROFILE_AVATAR_OPTIONS,
  readImageFileAsAvatarDataUrl,
} from '../models/profile-pane-format';

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
  | 'isOnboardingComplete'
  | 'onCompletionStatusChange'
>;

export function useProfilePaneForm({
  onSave,
  loading,
  initialTeamMembers = [],
  initialUsername = '',
  initialDisplayName = '',
  initialBio = '',
  initialCompanyName = '',
  initialAvatarUrl = '',
  initialEmail = '',
  initialIsVerified = false,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: ProfileFormArgs) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(initialIsVerified);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || PROFILE_AVATAR_OPTIONS[0]);
  const [teamMembers, setTeamMembers] = useState<ProfileTeamMember[]>(
    initialTeamMembers.length > 0
      ? initialTeamMembers
      : [
          {
            id: '1',
            username: initialUsername || 'current_user',
            displayName: initialDisplayName || 'Current User',
            avatarUrl: initialAvatarUrl || PROFILE_AVATAR_OPTIONS[0],
            role: 'admin',
            status: 'accepted',
            btcFeeBudget: 50000,
          },
        ],
  );
  const lastProfileAutosaveSignatureRef = useRef<string | null>(null);
  const suppressProfileAutosaveRef = useRef(false);
  const verifiedRef = useRef<boolean>(initialIsVerified);

  useEffect(() => {
    onCompletionStatusChange?.(true);
  }, [onCompletionStatusChange]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setIsVerified(initialIsVerified);
    verifiedRef.current = initialIsVerified;
  }, [initialIsVerified]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setUsername(initialUsername);
  }, [initialUsername]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setDisplayName(initialDisplayName);
  }, [initialDisplayName]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setBio(initialBio);
  }, [initialBio]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setCompanyName(initialCompanyName);
  }, [initialCompanyName]);

  useEffect(() => {
    suppressProfileAutosaveRef.current = true;
    setAvatarUrl(initialAvatarUrl || PROFILE_AVATAR_OPTIONS[0]);
  }, [initialAvatarUrl]);

  useEffect(() => {
    if (initialTeamMembers.length === 0) return;
    suppressProfileAutosaveRef.current = true;
    setTeamMembers(initialTeamMembers);
  }, [initialTeamMembers]);

  useEffect(() => {
    const supabase = createClient();

    const syncFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user?.email) {
        suppressProfileAutosaveRef.current = true;
        setEmail(user.email);
        if (!verifiedRef.current) {
          verifiedRef.current = true;
          setIsVerified(true);
        }
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
        suppressProfileAutosaveRef.current = true;
        setEmail(session.user.email);
        if (!verifiedRef.current) {
          verifiedRef.current = true;
          setIsVerified(true);
        }
      }
    });

    return () => {
      window.removeEventListener('message', msgHandler);
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (teamMembers.length !== 1) return;
    setTeamMembers((members) => [
      {
        ...members[0],
        username: username || members[0].username,
        displayName: displayName || members[0].displayName,
        avatarUrl: avatarUrl || PROFILE_AVATAR_OPTIONS[selectedAvatar] || members[0].avatarUrl,
      },
    ]);
  }, [avatarUrl, displayName, selectedAvatar, teamMembers.length, username]);

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
    }),
    [avatarUrl, bio, companyName, displayName, email, isVerified, selectedAvatar, teamMembers, username],
  );

  useEffect(() => {
    if (!isOnboardingComplete || loading) {
      return;
    }

    const signature = JSON.stringify(profileAutosavePayload);
    if (lastProfileAutosaveSignatureRef.current === null || suppressProfileAutosaveRef.current) {
      suppressProfileAutosaveRef.current = false;
      lastProfileAutosaveSignatureRef.current = signature;
      return;
    }
    if (lastProfileAutosaveSignatureRef.current === signature) {
      return;
    }

    const timer = window.setTimeout(() => {
      lastProfileAutosaveSignatureRef.current = signature;
      onSave(profileAutosavePayload);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [isOnboardingComplete, loading, onSave, profileAutosavePayload]);

  const currentTeamMember = useMemo(() => {
    const handle = username.trim().toLowerCase();
    return (
      teamMembers.find((member) => member.username.trim().toLowerCase() === handle) ??
      teamMembers[0] ??
      null
    );
  }, [teamMembers, username]);

  const currentRole: ProfileTeamMember['role'] = currentTeamMember?.role ?? 'admin';
  const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

  const inviteTeamMember = (input: {
    username: string;
    displayName: string;
    role: ProfileTeamMember['role'];
  }): { ok: true } | { ok: false; error: string } => {
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
    const displayName = input.displayName.trim() || handle;
    setTeamMembers((members) => [
      ...members,
      {
        id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: handle,
        displayName,
        avatarUrl: PROFILE_AVATAR_OPTIONS[members.length % PROFILE_AVATAR_OPTIONS.length],
        role: input.role,
        status: 'invited',
      },
    ]);
    return { ok: true };
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
    setTeamMembers((members) => members.filter((member) => member.id !== memberId));
    return { ok: true };
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(profileAutosavePayload);
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
    inviteTeamMember,
    removeTeamMember,
    handleSubmit,
  };
}

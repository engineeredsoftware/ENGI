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
import { PROFILE_AVATAR_OPTIONS } from '../models/profile-pane-format';

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
      if (event.data?.type === 'oauth-login-complete') {
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

  const selectAvatar = (index: number) => {
    setSelectedAvatar(index);
    setAvatarUrl(PROFILE_AVATAR_OPTIONS[index]);
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
    profileAutosavePayload,
    verifiedRef,
    selectAvatar,
    handleSubmit,
  };
}

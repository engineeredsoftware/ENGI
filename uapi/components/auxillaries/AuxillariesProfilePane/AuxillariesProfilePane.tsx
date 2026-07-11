"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/bitcode/indicators/LoadingSpinner/LoadingSpinner';
import { trackEvent } from '@bitcode/google-analytics';
import { reportError } from '@bitcode/errors';
import { createClient } from '@bitcode/supabase/ssr/client';

import AuxillariesProfilePaneHeader from '@/components/auxillaries/headers/AuxillariesProfilePaneHeader/AuxillariesProfilePaneHeader';
import type {
  AuxillariesProfileState,
  OrganizationPolicyAuthority,
} from '@/app/auxillaries/auxillary-onboarding-contract';

interface TeamMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'lead' | 'dev';
  status?: 'invited' | 'accepted';
  btcFeeBudget?: number;
}

type SupabaseAuthSession = {
  user?: {
    email?: string | null;
  } | null;
} | null;

function buildAvatarDataUri(seed: string, background: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
      <rect width="96" height="96" rx="28" fill="${background}"/>
      <circle cx="48" cy="34" r="16" fill="${accent}" fill-opacity="0.94"/>
      <path d="M20 80c3-18 16-28 28-28s25 10 28 28" fill="${accent}" fill-opacity="0.76"/>
      <text x="48" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white" fill-opacity="0.72">${seed}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const AVATAR_OPTIONS = [
  buildAvatarDataUri('A1', '#0f172a', '#67feb7'),
  buildAvatarDataUri('A2', '#111827', '#38bdf8'),
  buildAvatarDataUri('A3', '#1f2937', '#f9c855'),
  buildAvatarDataUri('A4', '#172033', '#c084fc'),
  buildAvatarDataUri('A5', '#0b1324', '#fb7185'),
  buildAvatarDataUri('A6', '#112131', '#22d3ee'),
];

export interface AuxillariesProfilePaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  initialTeamMembers?: TeamMember[];
  initialUsername?: string;
  initialDisplayName?: string;
  initialBio?: string;
  initialCompanyName?: string;
  initialAvatarUrl?: string;
  initialEmail?: string;
  initialIsVerified?: boolean;
  profileState?: AuxillariesProfileState | null;
  organizationAuthority?: OrganizationPolicyAuthority | null;
  isOnboardingComplete?: boolean;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

function readProfileReadinessLabel(state: AuxillariesProfileState | null | undefined) {
  if (!state) return 'Loading account state';
  if (state.accountReadiness === 'ready') return 'Ready';
  if (state.accountReadiness === 'degraded') return 'Needs repair';
  if (state.accountReadiness === 'blocked') return 'Blocked';
  return 'Unknown';
}

function readPolicyDecisionLabel(authority: OrganizationPolicyAuthority | null | undefined) {
  if (!authority) return 'Not projected';
  if (authority.policyDecision === 'allowed') return 'Allowed';
  return 'Denied';
}

function formatAuthorityValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'n/a';
}

function formatAuthorityList(values: string[] | null | undefined) {
  return values?.length ? values.join(', ') : 'none';
}

export default function AuxillariesProfilePane({
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
  profileState = null,
  organizationAuthority = null,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: AuxillariesProfilePaneProps) {
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
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || AVATAR_OPTIONS[0]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    initialTeamMembers.length > 0
      ? initialTeamMembers
      : [
          {
            id: '1',
            username: initialUsername || 'current_user',
            displayName: initialDisplayName || 'Current User',
            avatarUrl: initialAvatarUrl || AVATAR_OPTIONS[0],
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
    setAvatarUrl(initialAvatarUrl || AVATAR_OPTIONS[0]);
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
        avatarUrl: avatarUrl || AVATAR_OPTIONS[selectedAvatar] || members[0].avatarUrl,
      },
    ]);
  }, [avatarUrl, displayName, selectedAvatar, teamMembers.length, username]);

  const profileAutosavePayload = useMemo(
    () => ({
      username,
      displayName,
      bio,
      companyName,
      avatarUrl: avatarUrl || AVATAR_OPTIONS[selectedAvatar],
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

  const handleSendCode = async () => {
    setAuthError(null);
    setVerificationLoading(true);
    trackEvent('onboarding_profile_send_code');
    try {
      const supabase = createClient();
      const { error: createError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (createError && /already\s+registered/i.test(createError.message)) {
        await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        setIsVerifying(true);
      } else if (createError) {
        setAuthError('Failed to send verification code. Please try again.');
      } else {
        setIsVerifying(true);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Error sending code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setAuthError(null);
    setVerificationLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email',
      });
      if (error) {
        setAuthError(error.message);
        trackEvent('onboarding_profile_verify_code_error', { message: error.message });
      } else {
        setIsVerified(true);
        verifiedRef.current = true;
        trackEvent('onboarding_profile_verified');
        onSave({
          ...profileAutosavePayload,
          username: username || email.split('@')[0],
          email,
          isVerified: true,
        });
      }
    } catch (error: any) {
      reportError(error);
      setAuthError(error.message || 'Error verifying code');
      trackEvent('onboarding_profile_verify_code_error', { message: error?.message });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(profileAutosavePayload);
  };

  const selectAvatar = (index: number) => {
    setSelectedAvatar(index);
    setAvatarUrl(AVATAR_OPTIONS[index]);
  };
  const profileReadinessIssues = profileState?.profileCompleteness?.issues ?? [];
  const notificationPosture = profileState?.notificationPosture;
  const dataSharingPosture = profileState?.dataSharingPosture;

  return (
    <div data-testid="profile-step-container">
      <motion.div
        className="orbital-step-content profile-step"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="step-header">
          <AuxillariesProfilePaneHeader
            isOnboardingComplete={isOnboardingComplete}
            isVerified={isVerified}
          />
        </div>

        <form onSubmit={handleSubmit} className="step-form">
          {!isOnboardingComplete && (
            <motion.div
              className="onboarding-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                background: 'linear-gradient(145deg, rgba(15, 30, 50, 0.7), rgba(10, 20, 35, 0.7))',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid rgba(103, 254, 183, 0.22)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              }}
            >
              <strong style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.95)' }}>
                Step 3: Optional profile
              </strong>
              <p style={{ margin: '12px 0 0 0', fontSize: '15px', lineHeight: '1.5', color: 'rgba(255, 255, 255, 0.78)' }}>
                Profile only holds email, display identity, organization role, and account metadata.
                Wallets live in Wallet; GitHub and other providers live in Externals.
              </p>
            </motion.div>
          )}

          <section
            data-testid="auxillaries-profile-readiness"
            className="mb-6 rounded-[20px] border border-emerald-300/16 bg-emerald-300/[0.055] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
                  Account readiness
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {readProfileReadinessLabel(profileState)}
                </h3>
              </div>
              <div className="rounded-full border border-white/10 bg-black/24 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
                {profileState?.accountReadiness ?? 'loading'}
              </div>
            </div>
            <div className="mt-4 grid gap-3 tablet:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Wallet
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {profileState?.walletBinding?.address ? 'Binding present' : 'Binding repairable'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Notifications
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {notificationPosture
                    ? `${notificationPosture.state}${notificationPosture.unreadCount ? ` (${notificationPosture.unreadCount})` : ''}`
                    : 'Loading'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Data sharing
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {dataSharingPosture
                    ? `${dataSharingPosture.state} (${dataSharingPosture.enabledRepositoryCount}/${dataSharingPosture.repositoryCount})`
                    : 'Loading'}
                </p>
              </div>
            </div>
            {profileReadinessIssues.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {profileReadinessIssues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/18 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/84">{issue.summary}</p>
                      <p className="mt-1 text-xs text-white/54">{issue.requiredAction}</p>
                    </div>
                    <a
                      href={issue.repairRoute.route}
                      className="rounded-full border border-emerald-300/24 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-200/44"
                    >
                      {issue.repairRoute.label}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-white/64">
                Profile, wallet support, preferences, notifications, and data-sharing posture are complete.
              </p>
            )}
          </section>

          <section
            data-testid="auxillaries-organization-authority"
            className="mb-6 rounded-[20px] border border-sky-300/16 bg-sky-300/[0.052] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/72">
                  Organization authority
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {readPolicyDecisionLabel(organizationAuthority)}
                </h3>
              </div>
              <div className="rounded-full border border-white/10 bg-black/24 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
                {organizationAuthority?.policyDecision ?? 'not_projected'}
              </div>
            </div>

            <div className="mt-4 grid gap-3 tablet:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Organization
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {formatAuthorityValue(organizationAuthority?.organizationId)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Team/member
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {formatAuthorityValue(organizationAuthority?.teamId)} / {formatAuthorityValue(organizationAuthority?.memberId)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Wallet binding
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {organizationAuthority?.walletBindingState ?? 'not_projected'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Multi-sig
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {organizationAuthority?.multiSigPosture.state ?? 'not_projected'}
                  {organizationAuthority?.multiSigPosture.required
                    ? ` (${organizationAuthority.multiSigPosture.presentSignatures}/${organizationAuthority.multiSigPosture.requiredSignatures})`
                    : ''}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 tablet:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Policy action
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {formatAuthorityValue(organizationAuthority?.policy.action)}
                  {' '}
                  via
                  {' '}
                  {formatAuthorityValue(organizationAuthority?.policy.interfaceSurface)}
                </p>
                <p className="mt-2 break-all text-xs text-white/48">
                  {formatAuthorityValue(organizationAuthority?.policy.policyHash)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  Explicit grants
                </p>
                <p className="mt-2 text-sm text-white/78">
                  {formatAuthorityList(organizationAuthority?.explicitGrantSet)}
                </p>
                <p className="mt-2 text-xs text-white/48">
                  Role: {formatAuthorityValue(organizationAuthority?.role)}
                </p>
              </div>
            </div>

            {organizationAuthority?.denialReasons?.length ? (
              <div className="mt-4 grid gap-2">
                {organizationAuthority.denialReasons.slice(0, 6).map((reason) => (
                  <div
                    key={reason}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-300/18 bg-amber-300/[0.07] px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-amber-50">{reason}</span>
                    <a
                      href={organizationAuthority.recoveryRoute}
                      className="rounded-full border border-amber-200/24 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:border-amber-100/44"
                    >
                      Repair
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-white/64">
                Organization role, explicit grants, wallet binding, policy, and multi-sig posture admit the projected action.
              </p>
            )}

            <p className="mt-3 break-all text-xs leading-6 text-white/42">
              {organizationAuthority?.authorityRoot ?? 'authority root not projected'}
            </p>
          </section>

          <section className="account-creation-section mb-6 rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
                Optional contact
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">Email notifications</h3>
              <p className="mt-2 text-sm leading-7 text-white/66">
                Email does not authenticate Bitcode. It only adds notification and recovery contact after wallet identity exists.
              </p>
            </div>

            {authError ? <div data-testid="profile-error" className="mb-2 text-red-300">{authError}</div> : null}

            {!isVerifying && !isVerified ? (
              <div className="flex flex-wrap items-start gap-3">
                <div className="orbitals-users-input-container enterprise min-w-[16rem] flex-1">
                  <input
                    data-testid="profile-email-input"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="form-input"
                    placeholder="Receive notifications and Bitcode updates"
                  />
                  <div className="input-focus-indicator"></div>
                </div>
                <button
                  data-testid="profile-send-code"
                  type="button"
                  onClick={handleSendCode}
                  className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/12 px-5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/42 hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!email.trim() || verificationLoading}
                >
                  {verificationLoading ? (
                    <LoadingSpinner size={20} thickness={2} color="rgba(103,254,183,0.8)" trackColor="rgba(103,254,183,0.2)" />
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
            ) : null}

            {isVerifying && !isVerified ? (
              <div className="flex flex-wrap items-start gap-3">
                <div className="orbitals-users-input-container enterprise min-w-[16rem] flex-1">
                  <input
                    data-testid="profile-otp-input"
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    className="form-input"
                    placeholder={`Code sent to ${email}`}
                  />
                  <div className="input-focus-indicator"></div>
                </div>
                <button
                  data-testid="profile-verify-code"
                  type="button"
                  onClick={handleVerifyCode}
                  className="inline-flex h-14 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/80 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!/^\d{6}$/.test(verificationCode) || verificationLoading}
                >
                  {verificationLoading ? (
                    <LoadingSpinner size={20} thickness={2} color="rgba(0,30,60,0.9)" trackColor="rgba(0,30,60,0.3)" />
                  ) : (
                    'Verify'
                  )}
                </button>
                <button
                  data-testid="profile-change-email-button"
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="h-14 text-sm font-medium text-emerald-200/80 underline-offset-4 hover:underline"
                >
                  Change email
                </button>
              </div>
            ) : null}

            {isVerified ? (
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Email verified: <span className="font-semibold">{email}</span>
              </div>
            ) : null}
          </section>

          <section className="rounded-[20px] border border-white/10 bg-black/20 p-5">
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
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => selectAvatar(index)}
                      className={`h-12 w-12 rounded-2xl border bg-cover bg-center transition ${
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

          <section className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
              Organization role posture
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <span
                  key={`${member.id}-${member.role}`}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/74"
                >
                  {member.displayName || member.username || 'member'} · {member.role}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 px-5 py-4">
            <p className="text-sm leading-7 text-white/68">
              Profile changes save automatically. Wallet connection and GitHub installation are managed in their own auxillaries.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

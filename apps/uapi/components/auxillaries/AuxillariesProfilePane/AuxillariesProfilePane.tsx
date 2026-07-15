"use client";

/**
 * Profile auxillary pane — email contact, identity metadata, readiness, and
 * organization authority. Stateful form logic lives in hooks/; section UI is
 * co-located under named section directories.
 *
 * Layout mirrors Wallet: one space-y-5 stagger list so entrance CSS does not
 * animate both a parent form and its children (double-entrance on Profile).
 */

import React from 'react';

import AuxillariesProfilePaneHeader from '@/components/auxillaries/headers/AuxillariesProfilePaneHeader/AuxillariesProfilePaneHeader';

import type { AuxillariesProfilePaneProps } from './AuxillariesProfilePane.types';
import { useProfilePaneForm } from './hooks/use-profile-pane-form';
import { useProfileEmailVerification } from './hooks/use-profile-email-verification';
import OrganizationAuthoritySection from './OrganizationAuthoritySection/OrganizationAuthoritySection';
import ProfileEmailSection from './ProfileEmailSection/ProfileEmailSection';
import ProfileIdentitySection from './ProfileIdentitySection/ProfileIdentitySection';
import ProfileReadinessSection from './ProfileReadinessSection/ProfileReadinessSection';

export type { AuxillariesProfilePaneProps } from './AuxillariesProfilePane.types';

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
  const form = useProfilePaneForm({
    onSave,
    loading,
    initialTeamMembers,
    initialUsername,
    initialDisplayName,
    initialBio,
    initialCompanyName,
    initialAvatarUrl,
    initialEmail,
    initialIsVerified,
    isOnboardingComplete,
    onCompletionStatusChange,
  });

  const { handleSendCode, handleVerifyCode } = useProfileEmailVerification({
    email: form.email,
    verificationCode: form.verificationCode,
    profileAutosavePayload: form.profileAutosavePayload,
    username: form.username,
    setAuthError: form.setAuthError,
    setVerificationLoading: form.setVerificationLoading,
    setIsVerifying: form.setIsVerifying,
    setIsVerified: form.setIsVerified,
    verifiedRef: form.verifiedRef,
    onSave,
  });

  return (
    <div data-testid="profile-step-container">
      <div className="orbital-step-content profile-step">
        {/*
          Single stagger host (space-y-5), same as Wallet/Interfaces — avoid
          step-header + step-form nesting that double-applied pane-enter rise.
        */}
        <form onSubmit={form.handleSubmit} className="space-y-5">
          <AuxillariesProfilePaneHeader
            isOnboardingComplete={isOnboardingComplete}
            isVerified={form.isVerified}
          />

          {!isOnboardingComplete ? (
            <div
              className="onboarding-info rounded-none border border-emerald-300/22 bg-[linear-gradient(145deg,rgba(15,30,50,0.7),rgba(10,20,35,0.7))] px-5 py-5 shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
            >
              <strong className="text-base text-white/95">
                Step 3: Optional profile
              </strong>
              <p className="mt-3 text-[15px] leading-6 text-white/78">
                Profile only holds email, display identity, organization role, and account metadata.
                Wallets live in Wallet; GitHub and other providers live in Externals.
              </p>
            </div>
          ) : null}

          <ProfileReadinessSection profileState={profileState} />
          <OrganizationAuthoritySection organizationAuthority={organizationAuthority} />

          <ProfileEmailSection
            email={form.email}
            setEmail={form.setEmail}
            verificationCode={form.verificationCode}
            setVerificationCode={form.setVerificationCode}
            isVerifying={form.isVerifying}
            setIsVerifying={form.setIsVerifying}
            isVerified={form.isVerified}
            verificationLoading={form.verificationLoading}
            authError={form.authError}
            onSendCode={handleSendCode}
            onVerifyCode={handleVerifyCode}
          />

          <ProfileIdentitySection
            displayName={form.displayName}
            setDisplayName={form.setDisplayName}
            username={form.username}
            setUsername={form.setUsername}
            companyName={form.companyName}
            setCompanyName={form.setCompanyName}
            bio={form.bio}
            setBio={form.setBio}
            selectedAvatar={form.selectedAvatar}
            selectAvatar={form.selectAvatar}
            teamMembers={form.teamMembers}
          />

          <div className="rounded-none border border-white/10 bg-black/20 px-5 py-4">
            <p className="text-sm leading-7 text-white/68">
              Profile changes save automatically. Wallet connection and GitHub installation are managed in their own auxillaries.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

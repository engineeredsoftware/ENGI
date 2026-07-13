"use client";

/**
 * Profile auxillary pane — email contact, identity metadata, readiness, and
 * organization authority. Stateful form logic lives in hooks/; section UI is
 * co-located under named section directories.
 */

import React from 'react';
import { motion } from 'framer-motion';

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
      <motion.div
        className="orbital-step-content profile-step"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="step-header">
          <AuxillariesProfilePaneHeader
            isOnboardingComplete={isOnboardingComplete}
            isVerified={form.isVerified}
          />
        </div>

        <form onSubmit={form.handleSubmit} className="step-form">
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

          <div className="mt-5 rounded-none border border-white/10 bg-black/20 px-5 py-4">
            <p className="text-sm leading-7 text-white/68">
              Profile changes save automatically. Wallet connection and GitHub installation are managed in their own auxillaries.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

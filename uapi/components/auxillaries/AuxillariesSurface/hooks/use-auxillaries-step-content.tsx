/**
 * Renders the active auxillary pane (profile / wallet / externals / interfaces)
 * with shared save and completion wiring from the surface shell.
 */

import React, { useCallback } from 'react';
import type { ConcreteAuxillaryPane, AuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

import {
  ExternalsPane,
  InterfacesPane,
  ProfilePane,
  WalletPane,
} from '../auxillaries-surface-dynamic';

interface UseAuxillariesStepContentArgs {
  profileLoading: boolean;
  profileData: any;
  sessionUser: any;
  auxillaryData: any;
  isUnlockedSurface: boolean;
  shouldPersistOnboardingProgress: boolean;
  handleStepCompletionChange: (step: ConcreteAuxillaryPane, isComplete: boolean) => void;
  handleStepComplete: (step: ConcreteAuxillaryPane) => Promise<void>;
  updateProfileMutation: { mutateAsync: (updated: any) => Promise<any> };
  queryClient: { invalidateQueries: (opts: { queryKey: string[] }) => void };
}

export function useAuxillariesStepContent({
  profileLoading,
  profileData,
  sessionUser,
  auxillaryData,
  isUnlockedSurface,
  shouldPersistOnboardingProgress,
  handleStepCompletionChange,
  handleStepComplete,
  updateProfileMutation,
  queryClient,
}: UseAuxillariesStepContentArgs) {
  return useCallback((step: AuxillaryPane) => {
    switch (step) {
      case 'profile':
        return (
          <ProfilePane
            loading={profileLoading}
            initialEmail={profileData?.email || sessionUser?.email}
            initialUsername={profileData?.username}
            initialDisplayName={profileData?.display_name}
            initialBio={profileData?.bio}
            initialCompanyName={profileData?.company_name}
            initialAvatarUrl={profileData?.avatar_url}
            initialTeamMembers={profileData?.team_members}
            initialIsVerified={profileData?.is_verified ?? !!sessionUser?.email_confirmed_at}
            profileState={auxillaryData?.profileState ?? null}
            organizationAuthority={auxillaryData?.organizationAuthority ?? null}
            isOnboardingComplete={isUnlockedSurface}
            onCompletionStatusChange={
              shouldPersistOnboardingProgress ? (isComplete) => handleStepCompletionChange('profile', isComplete) : undefined
            }
            onSave={async (updated) => {
              try {
                await updateProfileMutation.mutateAsync(updated);
                await handleStepComplete('profile');
              } catch (err) {
                console.error('Profile save error:', err);
              }
            }}
          />
        );
      case 'externals':
        return (
          <ExternalsPane
            loading={false}
            isOnboardingComplete={isUnlockedSurface}
            onCompletionStatusChange={
              shouldPersistOnboardingProgress ? (isComplete) => handleStepCompletionChange('externals', isComplete) : undefined
            }
            onSave={async () => {
              await handleStepComplete('externals');
            }}
          />
        );
      case 'wallet':
        return (
          <WalletPane
            loading={false}
            isOnboardingComplete={isUnlockedSurface}
            onCompletionStatusChange={
              shouldPersistOnboardingProgress ? (isComplete) => handleStepCompletionChange('wallet', isComplete) : undefined
            }
            onSave={async (updated) => {
              try {
                await fetch('/api/auxillaries/model-preferences', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                });
                await handleStepComplete('wallet');
              } catch (err) {
                console.error('Wallet defaults save error:', err);
              }
            }}
          />
        );
      case 'interfaces':
        return (
          <InterfacesPane
            loading={false}
            isOnboardingComplete={isUnlockedSurface}
            onCompletionStatusChange={
              shouldPersistOnboardingProgress ? (isComplete) => handleStepCompletionChange('interfaces', isComplete) : undefined
            }
            onSave={async (updated) => {
              try {
                await fetch('/api/auxillaries/model-preferences', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                });
                queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
                await handleStepComplete('interfaces');
              } catch (err) {
                console.error('Model preferences save error:', err);
              }
            }}
          />
        );
      default:
        return null;
    }
  }, [
    handleStepComplete,
    handleStepCompletionChange,
    auxillaryData?.profileState,
    auxillaryData?.organizationAuthority,
    isUnlockedSurface,
    profileData,
    profileLoading,
    queryClient,
    sessionUser,
    shouldPersistOnboardingProgress,
    updateProfileMutation,
  ]);
}

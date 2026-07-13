/**
 * Local types for AuxillariesProfilePane — team membership, auth session
 * shape, and public pane props shared with extracted section components.
 */

import type {
  AuxillariesProfileState,
  OrganizationPolicyAuthority,
} from '@/app/auxillaries/auxillary-onboarding-contract';

export interface ProfileTeamMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'lead' | 'dev';
  status?: 'invited' | 'accepted';
  btcFeeBudget?: number;
}

export type SupabaseAuthSession = {
  user?: {
    email?: string | null;
  } | null;
} | null;

export interface AuxillariesProfilePaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  initialTeamMembers?: ProfileTeamMember[];
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

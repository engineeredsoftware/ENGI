/**
 * Organization settings form types shared by tab components and hooks.
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  emailDomain: string;
  logoUrl?: string;
  settings: {
    allowPublicSignup?: boolean;
    requireApproval?: boolean;
    defaultRole?: 'dev' | 'lead';
    maxMembers?: number;
    billingEmail?: string;
    webhookUrl?: string;
  };
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  btdBalance?: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettingsProps {
  organization: Organization;
  userRole: 'owner' | 'admin' | 'lead' | 'dev';
  onUpdate: (updates: Partial<Organization>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export interface OrganizationSettingsFormData {
  name: string;
  slug: string;
  emailDomain: string;
  logoUrl: string;
  allowPublicSignup: boolean;
  requireApproval: boolean;
  defaultRole: 'dev' | 'lead';
  maxMembers: number;
  billingEmail: string;
  webhookUrl: string;
}

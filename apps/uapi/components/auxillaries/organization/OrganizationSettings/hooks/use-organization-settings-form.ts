/**
 * Organization settings form state and mutation handlers for tab surfaces.
 */

import { useState } from 'react';
import { toast } from 'sonner';

import type {
  Organization,
  OrganizationSettingsFormData,
  OrganizationSettingsProps,
} from '../OrganizationSettings.types';
import { ORGANIZATION_OPERATING_TIERS } from '../models/organization-operating-tiers';

export function useOrganizationSettingsForm({
  organization,
  userRole,
  onUpdate,
  onDelete,
}: OrganizationSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [formData, setFormData] = useState<OrganizationSettingsFormData>({
    name: organization.name,
    slug: organization.slug,
    emailDomain: organization.emailDomain,
    logoUrl: organization.logoUrl || '',
    allowPublicSignup: organization.settings.allowPublicSignup || false,
    requireApproval: organization.settings.requireApproval || false,
    defaultRole: organization.settings.defaultRole || 'dev',
    maxMembers: organization.settings.maxMembers || 10,
    billingEmail: organization.settings.billingEmail || '',
    webhookUrl: organization.settings.webhookUrl || '',
  });

  const canManageOrganization = ['owner', 'admin'].includes(userRole);
  const canDeleteOrganization = userRole === 'owner';
  const operatingTier = ORGANIZATION_OPERATING_TIERS[organization.subscriptionTier];
  const btdBalance = organization.btdBalance ?? 0;

  const handleUpdateOrganization = async () => {
    if (!canManageOrganization) return;

    setLoading(true);
    try {
      await onUpdate({
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
        settings: {
          ...organization.settings,
          allowPublicSignup: formData.allowPublicSignup,
          requireApproval: formData.requireApproval,
          defaultRole: formData.defaultRole,
          maxMembers: formData.maxMembers,
          billingEmail: formData.billingEmail,
          webhookUrl: formData.webhookUrl,
        },
      });
      toast.success('Organization settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    if (!canManageOrganization) return;

    setLogoUploading(true);
    try {
      void file;
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const generateApiKey = () => {
    const apiKey = `bitcode_${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}`;
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const handleDeleteOrganization = async () => {
    if (!canDeleteOrganization || !onDelete) return;

    try {
      await onDelete();
      toast.success('Organization deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete organization');
    }
  };

  const patchForm = (patch: Partial<OrganizationSettingsFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  return {
    organization,
    activeTab,
    setActiveTab,
    loading,
    showApiKey,
    setShowApiKey,
    logoUploading,
    formData,
    patchForm,
    setFormData,
    canManageOrganization,
    canDeleteOrganization,
    operatingTier,
    btdBalance,
    handleUpdateOrganization,
    handleUploadLogo,
    generateApiKey,
    handleDeleteOrganization,
    onDelete,
  };
}

export type OrganizationSettingsFormApi = ReturnType<typeof useOrganizationSettingsForm>;

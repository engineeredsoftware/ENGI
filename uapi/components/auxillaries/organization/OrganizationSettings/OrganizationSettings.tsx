'use client';

/**
 * Organization settings shell — general, treasury, security, and advanced tabs.
 * Form state lives in hooks/; each tab is a named co-located unit.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/Tabs/Tabs';

import type { OrganizationSettingsProps } from './OrganizationSettings.types';
import { useOrganizationSettingsForm } from './hooks/use-organization-settings-form';
import OrganizationSettingsHeader from './OrganizationSettingsHeader/OrganizationSettingsHeader';
import OrganizationGeneralTab from './OrganizationGeneralTab/OrganizationGeneralTab';
import OrganizationTreasuryTab from './OrganizationTreasuryTab/OrganizationTreasuryTab';
import OrganizationSecurityTab from './OrganizationSecurityTab/OrganizationSecurityTab';
import OrganizationAdvancedTab from './OrganizationAdvancedTab/OrganizationAdvancedTab';

export type { OrganizationSettingsProps } from './OrganizationSettings.types';

export default function OrganizationSettings(props: OrganizationSettingsProps) {
  const form = useOrganizationSettingsForm(props);

  return (
    <div className="space-y-6">
      <OrganizationSettingsHeader
        organization={form.organization}
        operatingTier={form.operatingTier}
        canManageOrganization={form.canManageOrganization}
        loading={form.loading}
        onSave={form.handleUpdateOrganization}
      />

      <Tabs value={form.activeTab} onValueChange={form.setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <OrganizationGeneralTab
            formData={form.formData}
            setFormData={form.setFormData}
            canManageOrganization={form.canManageOrganization}
            logoUploading={form.logoUploading}
            operatingTier={form.operatingTier}
            onUploadLogo={form.handleUploadLogo}
          />
        </TabsContent>

        <TabsContent value="treasury" className="space-y-6">
          <OrganizationTreasuryTab
            organization={form.organization}
            operatingTier={form.operatingTier}
            btdBalance={form.btdBalance}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <OrganizationSecurityTab
            formData={form.formData}
            setFormData={form.setFormData}
            canManageOrganization={form.canManageOrganization}
            showApiKey={form.showApiKey}
            setShowApiKey={form.setShowApiKey}
            onGenerateApiKey={form.generateApiKey}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <OrganizationAdvancedTab
            organizationName={form.organization.name}
            canDeleteOrganization={form.canDeleteOrganization}
            onDelete={form.onDelete}
            onDeleteOrganization={form.handleDeleteOrganization}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

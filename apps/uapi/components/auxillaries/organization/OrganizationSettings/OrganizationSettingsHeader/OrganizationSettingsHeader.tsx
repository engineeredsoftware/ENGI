/**
 * Organization settings page header with logo, tier badge, and save action.
 */

import React from 'react';
import { Button } from '@/components/shadcn/Button/Button';
import { Badge } from '@/components/shadcn/Badge/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/Avatar/Avatar';

import type { Organization } from '../OrganizationSettings.types';
import type { ORGANIZATION_OPERATING_TIERS } from '../models/organization-operating-tiers';

type OperatingTier = (typeof ORGANIZATION_OPERATING_TIERS)[keyof typeof ORGANIZATION_OPERATING_TIERS];

export interface OrganizationSettingsHeaderProps {
  organization: Organization;
  operatingTier: OperatingTier;
  canManageOrganization: boolean;
  loading: boolean;
  onSave: () => void;
}

export default function OrganizationSettingsHeader({
  organization,
  operatingTier,
  canManageOrganization,
  loading,
  onSave,
}: OrganizationSettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={organization.logoUrl} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl text-white">
            {organization.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{organization.name}</h1>
          <div className="mt-1 flex items-center space-x-4">
            <Badge variant="secondary">@{organization.emailDomain}</Badge>
            <Badge className={operatingTier.color}>{operatingTier.label}</Badge>
            <span className="text-sm text-slate-600">
              {organization.memberCount} member{organization.memberCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      {canManageOrganization ? (
        <Button onClick={onSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null}
    </div>
  );
}

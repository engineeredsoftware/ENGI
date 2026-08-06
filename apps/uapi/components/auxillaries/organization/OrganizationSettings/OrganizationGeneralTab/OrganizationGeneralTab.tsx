/**
 * General organization details and team settings tab.
 */

import React from 'react';
import { Button } from '@/components/shadcn/Button/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/Card/Card';
import { Input } from '@/components/shadcn/Input/Input';
import { Label } from '@/components/shadcn/Label/Label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/Avatar/Avatar';
import { Switch } from '@/components/shadcn/Switch/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/Select/Select';
import { Building2, Upload, Users } from 'lucide-react';

import type { OrganizationSettingsFormData } from '../OrganizationSettings.types';
import type { ORGANIZATION_OPERATING_TIERS } from '../models/organization-operating-tiers';

type OperatingTier = (typeof ORGANIZATION_OPERATING_TIERS)[keyof typeof ORGANIZATION_OPERATING_TIERS];

export interface OrganizationGeneralTabProps {
  formData: OrganizationSettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrganizationSettingsFormData>>;
  canManageOrganization: boolean;
  logoUploading: boolean;
  operatingTier: OperatingTier;
  onUploadLogo: (file: File) => void;
}

export default function OrganizationGeneralTab({
  formData,
  setFormData,
  canManageOrganization,
  logoUploading,
  operatingTier,
  onUploadLogo,
}: OrganizationGeneralTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Organization Details</span>
          </CardTitle>
          <CardDescription>
            Basic metadata and access defaults for this Bitcode organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!canManageOrganization}
              />
            </div>
            <div>
              <Label htmlFor="org-slug">URL Slug</Label>
              <Input
                id="org-slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                disabled={!canManageOrganization}
              />
              <p className="mt-1 text-xs text-slate-500">app.bitcode.ai/{formData.slug}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="email-domain">Email Domain</Label>
            <Input id="email-domain" value={formData.emailDomain} disabled className="bg-slate-50" />
            <p className="mt-1 text-xs text-slate-500">Contact support to change your email domain.</p>
          </div>

          <div>
            <Label>Organization Logo</Label>
            <div className="mt-2 flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.logoUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {canManageOrganization ? (
                <div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUploadLogo(file);
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="outline" size="sm" disabled={logoUploading} asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {logoUploading ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </Button>
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Settings</span>
          </CardTitle>
          <CardDescription>
            Configure who can enter and how member roles are assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow public signup</Label>
              <p className="text-sm text-slate-600">
                Let anyone with your email domain request access automatically.
              </p>
            </div>
            <Switch
              checked={formData.allowPublicSignup}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowPublicSignup: checked }))}
              disabled={!canManageOrganization}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require approval</Label>
              <p className="text-sm text-slate-600">
                New members require admin approval before they can transact.
              </p>
            </div>
            <Switch
              checked={formData.requireApproval}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requireApproval: checked }))}
              disabled={!canManageOrganization}
            />
          </div>

          <div>
            <Label htmlFor="default-role">Default Role</Label>
            <Select
              value={formData.defaultRole}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, defaultRole: value }))}
              disabled={!canManageOrganization}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Developer</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-slate-500">Role assigned to new members by default.</p>
          </div>

          <div>
            <Label htmlFor="max-members">Maximum Members</Label>
            <Input
              id="max-members"
              type="number"
              min="1"
              max={operatingTier.maxMembers === -1 ? 1000 : operatingTier.maxMembers}
              value={formData.maxMembers}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: Number(e.target.value) }))}
              disabled={!canManageOrganization}
            />
            <p className="mt-1 text-xs text-slate-500">
              {operatingTier.maxMembers === -1
                ? 'Unlimited members on the Network operating tier.'
                : `Maximum ${operatingTier.maxMembers} members on ${operatingTier.label}.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

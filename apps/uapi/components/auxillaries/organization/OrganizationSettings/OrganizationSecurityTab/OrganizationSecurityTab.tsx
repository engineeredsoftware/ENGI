/**
 * Organization API key and webhook security tab.
 */

import React from 'react';
import { Button } from '@/components/shadcn/Button/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/Card/Card';
import { Input } from '@/components/shadcn/Input/Input';
import { Label } from '@/components/shadcn/Label/Label';
import { Copy, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';

import type { OrganizationSettingsFormData } from '../OrganizationSettings.types';

export interface OrganizationSecurityTabProps {
  formData: OrganizationSettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrganizationSettingsFormData>>;
  canManageOrganization: boolean;
  showApiKey: boolean;
  setShowApiKey: (value: boolean) => void;
  onGenerateApiKey: () => void;
}

export default function OrganizationSecurityTab({
  formData,
  setFormData,
  canManageOrganization,
  showApiKey,
  setShowApiKey,
  onGenerateApiKey,
}: OrganizationSecurityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>API Access</span>
        </CardTitle>
        <CardDescription>
          Manage API keys and webhook delivery for organization integrations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>API Key</Label>
            <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input type={showApiKey ? 'text' : 'password'} value="bitcode_1234567890abcdef" readOnly className="font-mono" />
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText('bitcode_1234567890abcdef')}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onGenerateApiKey}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Keep your API key secure. It provides full access to your organization.
          </p>
        </div>

        <div>
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            value={formData.webhookUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, webhookUrl: e.target.value }))}
            placeholder="https://your-app.com/webhooks/bitcode"
            disabled={!canManageOrganization}
          />
          <p className="mt-1 text-xs text-slate-500">
            Receive notifications about member posture, treasury events, and execution activity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

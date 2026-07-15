/**
 * Organization treasury posture tab — BTD balance, tier, wallet/externals links.
 */

import React from 'react';
import { Button } from '@/components/shadcn/Button/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/Card/Card';
import { Badge } from '@/components/shadcn/Badge/Badge';
import { CheckCircle, Github, Wallet, Waypoints } from 'lucide-react';

import type { Organization } from '../OrganizationSettings.types';
import {
  openAuxillaryRoute,
  type ORGANIZATION_OPERATING_TIERS,
} from '../models/organization-operating-tiers';

type OperatingTier = (typeof ORGANIZATION_OPERATING_TIERS)[keyof typeof ORGANIZATION_OPERATING_TIERS];

export interface OrganizationTreasuryTabProps {
  organization: Organization;
  operatingTier: OperatingTier;
  btdBalance: number;
}

export default function OrganizationTreasuryTab({
  organization,
  operatingTier,
  btdBalance,
}: OrganizationTreasuryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Organization Treasury</span>
        </CardTitle>
        <CardDescription>
          Treasury posture is wallet-settled in BTC and issued in $BTD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-none border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{operatingTier.label}</h3>
              <p className="text-slate-600">{operatingTier.description}</p>
            </div>
            <Badge className={operatingTier.color}>{operatingTier.label}</Badge>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">$BTD Balance</p>
              <p className="text-2xl font-bold text-emerald-600">{btdBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Members</p>
              <p className="text-2xl font-bold">
                {organization.memberCount}
                {operatingTier.maxMembers !== -1 ? ` / ${operatingTier.maxMembers}` : ''}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Operating posture:</p>
            <ul className="space-y-1 text-sm text-slate-600">
              {operatingTier.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-4 tablet:grid-cols-3">
          <div className="rounded-none border bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Wallet className="h-4 w-4 text-emerald-700" />
              Connected wallet
            </div>
            <p className="text-sm text-slate-600">
              BTC settlement and issued BTD posture are reviewed from Wallet.
            </p>
          </div>
          <div className="rounded-none border bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Github className="h-4 w-4 text-emerald-700" />
              GitHub before transacting
            </div>
            <p className="text-sm text-slate-600">
              Reads, asset packs, and repository delivery stay blocked until GitHub posture is connected.
            </p>
          </div>
          <div className="rounded-none border bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Waypoints className="h-4 w-4 text-emerald-700" />
              Externals governs entry
            </div>
            <p className="text-sm text-slate-600">
              SSO variety, external-provider posture, and repository access are configured in the Externals auxillary.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openAuxillaryRoute('wallet')}>
            <Wallet className="mr-2 h-4 w-4" />
            Open Wallet Auxillary
          </Button>
          <Button variant="outline" onClick={() => openAuxillaryRoute('externals')}>
            <Github className="mr-2 h-4 w-4" />
            Open Externals Auxillary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

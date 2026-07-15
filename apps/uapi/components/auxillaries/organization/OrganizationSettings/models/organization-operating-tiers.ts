/**
 * Operating-tier catalog for organization treasury posture display.
 */

import { buildAuxillariesRoutePath, type ConcreteAuxillaryPane } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export const ORGANIZATION_OPERATING_TIERS = {
  free: {
    label: 'Foundation',
    description: 'Minimal Bitcode posture for early treasury and team coordination.',
    maxMembers: 5,
    btdGuidance: 'Bring a connected wallet and GitHub surface before heavier transactions.',
    features: ['Identity and access posture', 'Wallet + GitHub prerequisite guidance', 'Core team coordination'],
    color: 'bg-slate-100 text-slate-800',
  },
  pro: {
    label: 'Operator',
    description: 'Expanded Bitcode operating posture for repeatable team and transaction flow.',
    maxMembers: 50,
    btdGuidance: 'Sustain repeatable BTC settlement and governed $BTD allocation across the team.',
    features: ['Treasury review surfaces', 'Execution and activity visibility', 'Priority operator support'],
    color: 'bg-blue-100 text-blue-800',
  },
  enterprise: {
    label: 'Network',
    description: 'Broad Bitcode operating posture for governed organizations and larger transaction volume.',
    maxMembers: -1,
    btdGuidance: 'Coordinate treasury, policy, and audited transaction posture across the network.',
    features: ['Unlimited members', 'Network-grade policy posture', 'Dedicated operator coordination'],
    color: 'bg-purple-100 text-purple-800',
  },
} as const;

export type OrganizationSubscriptionTier = keyof typeof ORGANIZATION_OPERATING_TIERS;

export function openAuxillaryRoute(step: Extract<ConcreteAuxillaryPane, 'wallet' | 'externals'>) {
  if (typeof window !== 'undefined') {
    window.location.assign(buildAuxillariesRoutePath(step));
  }
}

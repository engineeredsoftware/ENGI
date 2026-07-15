/**
 * Pure formatters and avatar seeds for the profile auxillary pane.
 * Keeps readiness/authority label projection out of the React tree.
 */

import type {
  AuxillariesProfileState,
  OrganizationPolicyAuthority,
} from '@/app/auxillaries/auxillary-onboarding-contract';

function buildAvatarDataUri(seed: string, background: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
      <rect width="96" height="96" rx="28" fill="${background}"/>
      <circle cx="48" cy="34" r="16" fill="${accent}" fill-opacity="0.94"/>
      <path d="M20 80c3-18 16-28 28-28s25 10 28 28" fill="${accent}" fill-opacity="0.76"/>
      <text x="48" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white" fill-opacity="0.72">${seed}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const PROFILE_AVATAR_OPTIONS = [
  buildAvatarDataUri('A1', '#0f172a', '#67feb7'),
  buildAvatarDataUri('A2', '#111827', '#38bdf8'),
  buildAvatarDataUri('A3', '#1f2937', '#f9c855'),
  buildAvatarDataUri('A4', '#172033', '#c084fc'),
  buildAvatarDataUri('A5', '#0b1324', '#fb7185'),
  buildAvatarDataUri('A6', '#112131', '#22d3ee'),
];

export function readProfileReadinessLabel(state: AuxillariesProfileState | null | undefined) {
  if (!state) return 'Loading account state';
  if (state.accountReadiness === 'ready') return 'Ready';
  if (state.accountReadiness === 'degraded') return 'Needs repair';
  if (state.accountReadiness === 'blocked') return 'Blocked';
  return 'Unknown';
}

export function readPolicyDecisionLabel(authority: OrganizationPolicyAuthority | null | undefined) {
  if (!authority) return 'Not projected';
  if (authority.policyDecision === 'allowed') return 'Allowed';
  return 'Denied';
}

export function formatAuthorityValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'n/a';
}

export function formatAuthorityList(values: string[] | null | undefined) {
  return values?.length ? values.join(', ') : 'none';
}

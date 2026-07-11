import {
  AUXILLARY_FLOW_STEPS,
  type ConcreteAuxillaryPane,
  normalizeAuxillaryPane,
  normalizeAuxillarySteps,
} from '@bitcode/api/src/routes/auxillaries-contract';

export const AUXILLARY_RING_STEPS = ['wallet', 'externals', 'profile', 'interfaces'] as const;
export const AUXILLARY_ROUTE_SEQUENCE = AUXILLARY_RING_STEPS;
export const AUXILLARIES_ACCESS_LABEL = 'Auxillaries access';
export const AUXILLARIES_LABEL = 'Auxillaries';
export const AUXILLARIES_LIST_LABEL = 'Wallet, Externals, Profile, and Interfaces';
export const AUXILLARIES_LIST_COMPACT_LABEL = 'Wallet, Externals, Profile, Interfaces';
export const OPEN_AUXILLARIES_FULLSCREEN_LABEL = 'Open Auxillaries fullscreen';
export const OPEN_TRANSACTIONS_LABEL = 'Open Packs';
export const AUXILLARIES_ROUTE_ROOT = '/auxillaries';
export const AUXILLARIES_COMPAT_ROUTE_ROOT = '/orbitals';
export const AUXILLARY_OVERLAY_ROUTE_ROOT = '/packs';
export const AUXILLARY_OPEN_QUERY_PARAM = 'auxillary-open-to';

export type AuxillaryPane = ConcreteAuxillaryPane | null;

export interface AuxillaryPaneDescriptor {
  label: string;
  routeSegment: string;
  ringIndex: number;
  labelPosition: 'top' | 'right' | 'bottom' | 'left';
  routeTitle: string;
  routeDescription: string;
}

export const AUXILLARY_DESCRIPTORS: Record<ConcreteAuxillaryPane, AuxillaryPaneDescriptor> = {
  profile: {
    label: 'Profile',
    routeSegment: 'profile',
    ringIndex: 2,
    labelPosition: 'bottom',
    routeTitle: 'Profile Auxillary',
    routeDescription:
      'Manage optional email, display identity, admin role, and organization membership without mixing in wallet or third-party connection controls.',
  },
  externals: {
    label: 'Externals',
    routeSegment: 'externals',
    ringIndex: 1,
    labelPosition: 'right',
    routeTitle: 'Externals Auxillary',
    routeDescription:
      'Attach GitHub and other non-wallet third-party bindings Bitcode reuses across read measurement, asset-pack synthesis, settlement follow-through, and external interface behavior.',
  },
  interfaces: {
    label: 'Interfaces',
    routeSegment: 'interfaces',
    ringIndex: 3,
    labelPosition: 'left',
    routeTitle: 'Interfaces Auxillary',
    routeDescription:
      'Shape how Packs, Deposits, Reads, MCP API, ChatGPT App, proofs, and default Bitcode behavior read and operate through one focused auxillary.',
  },
  wallet: {
    label: 'Wallet',
    routeSegment: 'wallet',
    ringIndex: 0,
    labelPosition: 'top',
    routeTitle: 'Wallet Auxillary',
    routeDescription:
      'Connect Bitcoin wallet providers, review BTC and BTD balances, and inspect wallet-bound source-share posture in one focused auxillary.',
  },
};

export { AUXILLARY_FLOW_STEPS, normalizeAuxillaryPane, normalizeAuxillarySteps };
export type { ConcreteAuxillaryPane } from '@bitcode/api/src/routes/auxillaries-contract';

export function labelForAuxillaryPane(step: AuxillaryPane) {
  if (!step) return '';
  return AUXILLARY_DESCRIPTORS[step].label;
}

export function getAuxillaryRouteSegment(step: ConcreteAuxillaryPane) {
  return AUXILLARY_DESCRIPTORS[step].routeSegment;
}

export function buildAuxillariesRoutePath(stepOrSegment: ConcreteAuxillaryPane | string) {
  const normalizedStep = normalizeAuxillaryPane(stepOrSegment);
  const routeSegment = normalizedStep
    ? getAuxillaryRouteSegment(normalizedStep)
    : stepOrSegment.trim().toLowerCase();
  return `${AUXILLARY_OVERLAY_ROUTE_ROOT}?${AUXILLARY_OPEN_QUERY_PARAM}=${encodeURIComponent(routeSegment)}`;
}

export function readAuxillaryOverlayStep(searchParams: URLSearchParams) {
  return normalizeAuxillaryPane(searchParams.get(AUXILLARY_OPEN_QUERY_PARAM));
}

export function isAuxillariesPath(pathname: string | null | undefined) {
  return Boolean(pathname?.startsWith(AUXILLARIES_ROUTE_ROOT));
}

export function isAuxillariesCompatPath(pathname: string | null | undefined) {
  return Boolean(pathname?.startsWith(AUXILLARIES_COMPAT_ROUTE_ROOT));
}

export function getAuxillaryRingIndex(step: ConcreteAuxillaryPane) {
  return AUXILLARY_DESCRIPTORS[step].ringIndex;
}

export function getAuxillaryLabelPosition(step: ConcreteAuxillaryPane) {
  return AUXILLARY_DESCRIPTORS[step].labelPosition;
}

export function getAuxillaryDescriptor(step: ConcreteAuxillaryPane) {
  return AUXILLARY_DESCRIPTORS[step];
}

export function getAuxillaryLayerLabel(step: ConcreteAuxillaryPane) {
  switch (step) {
    case 'externals':
      return 'externals lane';
    case 'interfaces':
      return 'interface lane';
    case 'profile':
      return 'profile lane';
    case 'wallet':
      return 'wallet lane';
    default:
      return 'auxillary';
  }
}

export function getAuxillaryOpenActionLabel(step?: ConcreteAuxillaryPane | null) {
  if (!step) return OPEN_AUXILLARIES_FULLSCREEN_LABEL;
  return `Open ${labelForAuxillaryPane(step)} fullscreen`;
}

export function getAuxillariesWorkspaceHeading(mode: 'onboarding' | 'auxillaries') {
  return mode === 'auxillaries'
    ? `Keep ${AUXILLARIES_LIST_LABEL} in one contained auxillary read.`
    : `Sign in once, then keep ${AUXILLARIES_LIST_LABEL} in one contained auxillary read.`;
}

export function getAuxillariesWorkspaceDescription(mode: 'onboarding' | 'auxillaries') {
  return mode === 'auxillaries'
    ? 'Use the selector list to keep each auxillary attached to the same stable reading surface: wallet identity, external connections, optional profile data, interface defaults, and follow-through stay one click apart without changing the Terminal context.'
    : 'Open Bitcode access in a stable auxillary read, then move between Wallet, Externals, Profile, and Interfaces without losing the active pane or route context.';
}

export function getAuxillariesTabsDescription(mode: 'onboarding' | 'auxillaries') {
  return mode === 'auxillaries'
    ? `Move between ${AUXILLARIES_LIST_COMPACT_LABEL} without losing your place in the auxillary read.`
    : `Sign in to unlock the four auxillaries, then keep ${AUXILLARIES_LIST_LABEL} in one contained auxillary read.`;
}

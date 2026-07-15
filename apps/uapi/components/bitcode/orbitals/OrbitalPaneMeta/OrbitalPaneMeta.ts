import {
  AUXILLARIES_ACCESS_LABEL as ORBITALS_ACCESS_LABEL,
  AUXILLARIES_LABEL as ORBITALS_LABEL,
  AUXILLARIES_LIST_COMPACT_LABEL as ORBITALS_LIST_COMPACT_LABEL,
  AUXILLARIES_LIST_LABEL as ORBITALS_LIST_LABEL,
  AUXILLARIES_ROUTE_ROOT,
  AUXILLARY_DESCRIPTORS as ORBITAL_DESCRIPTORS,
  AUXILLARY_FLOW_STEPS as ONBOARDING_FLOW_STEPS,
  AUXILLARY_FLOW_STEPS as ORBITAL_FLOW_STEPS,
  AUXILLARY_RING_STEPS as ORBITAL_RING_STEPS,
  AUXILLARY_ROUTE_SEQUENCE as ORBITAL_ROUTE_SEQUENCE,
  AUXILLARIES_COMPAT_ROUTE_ROOT as ORBITALS_SUPPORT_ROUTE_ROOT,
  OPEN_AUXILLARIES_FULLSCREEN_LABEL as OPEN_ORBITALS_FULLSCREEN_LABEL,
  OPEN_TRANSACTIONS_LABEL,
  buildAuxillariesRoutePath,
  getAuxillariesTabsDescription,
  getAuxillariesWorkspaceDescription,
  getAuxillariesWorkspaceHeading,
  getAuxillaryDescriptor,
  getAuxillaryLabelPosition,
  getAuxillaryLayerLabel,
  getAuxillaryOpenActionLabel,
  getAuxillaryRingIndex,
  getAuxillaryRouteSegment,
  isAuxillariesCompatPath as isOrbitalsSupportPath,
  isAuxillariesPath,
  labelForAuxillaryPane,
  normalizeAuxillaryPane,
  normalizeAuxillarySteps,
  type AuxillaryPane,
  type AuxillaryPaneDescriptor,
  type ConcreteAuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export {
  AUXILLARIES_ROUTE_ROOT,
  ONBOARDING_FLOW_STEPS,
  OPEN_ORBITALS_FULLSCREEN_LABEL,
  OPEN_TRANSACTIONS_LABEL,
  ORBITAL_DESCRIPTORS,
  ORBITAL_FLOW_STEPS,
  ORBITAL_RING_STEPS,
  ORBITAL_ROUTE_SEQUENCE,
  ORBITALS_ACCESS_LABEL,
  ORBITALS_SUPPORT_ROUTE_ROOT,
  ORBITALS_LABEL,
  ORBITALS_LIST_COMPACT_LABEL,
  ORBITALS_LIST_LABEL,
  buildAuxillariesRoutePath,
  isAuxillariesPath,
  isOrbitalsSupportPath,
};

export type ConcreteOrbitalPane = ConcreteAuxillaryPane;
export type OrbitalPane = AuxillaryPane;
export type OrbitalPaneDescriptor = AuxillaryPaneDescriptor;

export const normalizeOrbitalPane = normalizeAuxillaryPane;
export const normalizeOrbitalSteps = normalizeAuxillarySteps;
export const labelForOrbitalPane = labelForAuxillaryPane;
export const getOrbitalRouteSegment = getAuxillaryRouteSegment;
export const getOrbitalRingIndex = getAuxillaryRingIndex;
export const getOrbitalLabelPosition = getAuxillaryLabelPosition;
export const getOrbitalDescriptor = getAuxillaryDescriptor;
export const getOrbitalLayerLabel = getAuxillaryLayerLabel;
export const getOrbitalOpenActionLabel = getAuxillaryOpenActionLabel;
export const getOrbitalsWorkspaceHeading = (mode: 'onboarding' | 'auxillaries') =>
  getAuxillariesWorkspaceHeading(mode);
export const getOrbitalsWorkspaceDescription = (mode: 'onboarding' | 'auxillaries') =>
  getAuxillariesWorkspaceDescription(mode);
export const getOrbitalsTabsDescription = (mode: 'onboarding' | 'auxillaries') =>
  getAuxillariesTabsDescription(mode);

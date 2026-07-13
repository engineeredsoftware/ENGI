/**
 * Path parsing helpers for the AuxillariesSurface shell.
 */

import {
  normalizeAuxillaryPane,
  type ConcreteAuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export function parseAuxillaryPath(pathname: string | null): ConcreteAuxillaryPane | null {
  if (!pathname) return null;
  const match = pathname.match(/\/(?:auxillaries|orbitals)\/(profile|connects|externals|interfaces|btd|wallet)\b/i);
  if (!match) return null;
  return normalizeAuxillaryPane(match[1]);
}

/** Lazy analytics / error reporters to keep the surface bundle light. */
export const trackEvent = (...args: any[]) => {
  import('@bitcode/google-analytics').then((module) => (module as any).trackEvent?.(...args));
};

export const reportError = (...args: any[]) => {
  import('@bitcode/errors').then((module) => (module as any).reportError?.(...args));
};

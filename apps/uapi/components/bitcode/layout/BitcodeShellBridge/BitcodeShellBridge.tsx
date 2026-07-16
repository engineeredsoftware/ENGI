'use client';

/**
 * Layout provider retained for deposit/read route shells.
 * No longer bridges a legacy standalone witness shell — children only.
 */

import type { ReactNode } from 'react';

export type BitcodeShellSnapshot = null;
export type BitcodeShellControls = null;

export function BitcodeShellBridgeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** @deprecated No witness shell; returns empty shell state for any remaining callers. */
export function useBitcodeShellBridge() {
  return {
    snapshot: null as BitcodeShellSnapshot,
    controls: null as BitcodeShellControls,
    lastUpdatedAt: 0,
    refresh: async () => null as BitcodeShellSnapshot,
    runControl: async () => null,
  };
}

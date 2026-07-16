'use client';

/**
 * Layout provider retained for deposit/read route shells.
 * No longer bridges a standalone witness shell — children only.
 */

import type { ReactNode } from 'react';

export function BitcodeShellBridgeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

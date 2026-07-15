'use client';

/**
 * Dynamic pane imports for AuxillariesSurface — keep SSR off and show pulse loaders.
 */

import React from 'react';
import dynamic from 'next/dynamic';

/** Pulse placeholder that does not participate in auxillaries-pane-enter rise. */
function AuxPaneLoading({ className }: { className: string }) {
  return (
    <div
      className={`auxillaries-pane-enter-skip animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export const AuxillariesLoginPane = dynamic(() => import('@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="h-96 w-full" />,
});

export const AuxillariesContent = dynamic(() => import('@/components/auxillaries/AuxillariesContent/AuxillariesContent'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="h-96 w-full" />,
});

export const ProfilePane = dynamic(() => import('@/components/auxillaries/AuxillariesProfilePane/AuxillariesProfilePane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="h-64 w-full" />,
});

export const ExternalsPane = dynamic(() => import('@/components/auxillaries/AuxillariesExternalsPane/AuxillariesExternalsPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="h-64 w-full" />,
});

export const WalletPane = dynamic(() => import('@/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="h-64 w-full" />,
});

export const InterfacesPane = dynamic(() => import('@/components/auxillaries/AuxillariesInterfacesPane/AuxillariesInterfacesPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="h-64 w-full" />,
});

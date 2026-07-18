'use client';

/**
 * Dynamic pane imports for AuxillariesSurface — keep SSR off and show pulse loaders.
 */

import React from 'react';
import dynamic from 'next/dynamic';

/**
 * Minimal loading slot — avoid tall pulse blocks that force layout thrash on
 * open while the pane chunk is still resolving (prefer empty + paint shell).
 */
function AuxPaneLoading({ className }: { className: string }) {
  return (
    <div
      className={`auxillaries-pane-enter-skip ${className}`}
      aria-hidden="true"
    />
  );
}

export const AuxillariesLoginPane = dynamic(() => import('@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="min-h-[12rem] w-full" />,
});

export const AuxillariesContent = dynamic(() => import('@/components/auxillaries/AuxillariesContent/AuxillariesContent'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="min-h-[12rem] w-full" />,
});

export const ProfilePane = dynamic(() => import('@/components/auxillaries/AuxillariesProfilePane/AuxillariesProfilePane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="min-h-[8rem] w-full" />,
});

export const ExternalsPane = dynamic(() => import('@/components/auxillaries/AuxillariesExternalsPane/AuxillariesExternalsPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="min-h-[8rem] w-full" />,
});

export const WalletPane = dynamic(() => import('@/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="min-h-[8rem] w-full" />,
});

export const InterfacesPane = dynamic(() => import('@/components/auxillaries/AuxillariesInterfacesPane/AuxillariesInterfacesPane'), {
  ssr: false,
  loading: () => <AuxPaneLoading className="min-h-[8rem] w-full" />,
});

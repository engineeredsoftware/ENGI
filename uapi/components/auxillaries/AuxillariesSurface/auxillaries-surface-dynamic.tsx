'use client';

/**
 * Dynamic pane imports for AuxillariesSurface — keep SSR off and show pulse loaders.
 */

import React from 'react';
import dynamic from 'next/dynamic';

export const AuxillariesLoginPane = dynamic(() => import('@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 w-full" />,
});

export const AuxillariesContent = dynamic(() => import('@/components/auxillaries/AuxillariesContent/AuxillariesContent'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 w-full" />,
});

export const ProfilePane = dynamic(() => import('@/components/auxillaries/AuxillariesProfilePane/AuxillariesProfilePane'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 w-full" />,
});

export const ExternalsPane = dynamic(() => import('@/components/auxillaries/AuxillariesExternalsPane/AuxillariesExternalsPane'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 w-full" />,
});

export const WalletPane = dynamic(() => import('@/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 w-full" />,
});

export const InterfacesPane = dynamic(() => import('@/components/auxillaries/AuxillariesInterfacesPane/AuxillariesInterfacesPane'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 w-full" />,
});

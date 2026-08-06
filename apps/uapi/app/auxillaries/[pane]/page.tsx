import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import {
  buildAuxillariesRoutePath,
  getAuxillaryDescriptor,
  normalizeAuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

type AuxillariesPanePageProps = {
  params: {
    pane: string;
  };
};

function resolveAuxillaryPane(pane: string) {
  const step = normalizeAuxillaryPane(pane);
  if (!step) return null;

  return {
    step,
    descriptor: getAuxillaryDescriptor(step),
  };
}

export function generateMetadata({ params }: AuxillariesPanePageProps): Metadata {
  const resolved = resolveAuxillaryPane(params.pane);
  if (!resolved) {
    return {
      title: 'Bitcode Auxillaries',
      description: 'Contained Bitcode auxillary routes for wallet, externals, profile, and interfaces.',
    };
  }

  return {
    title: `Bitcode • ${resolved.descriptor.routeTitle}`,
    description: resolved.descriptor.routeDescription,
    alternates: {
      canonical: buildAuxillariesRoutePath(resolved.step),
    },
  };
}

export default function AuxillariesPanePage({ params }: AuxillariesPanePageProps) {
  const resolved = resolveAuxillaryPane(params.pane);
  if (!resolved) {
    notFound();
  }

  redirect(buildAuxillariesRoutePath(resolved.step));
}

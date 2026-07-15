import type { Metadata } from 'next';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';

import EdgetimesPageContent from './EdgetimesPageContent';

export const metadata: Metadata = {
  title: 'Bitcode Edgetimes',
  description:
    'Fourth-gate storage and API posture for Bitcode persistence, schema ownership, retained packages, and typed query boundaries.',
  alternates: {
    canonical: '/edgetimes',
  },
};

export default function EdgetimesPage() {
  return (
    <PublicShellFrame>
      <EdgetimesPageContent />
    </PublicShellFrame>
  );
}

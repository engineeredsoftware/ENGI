import type { Metadata } from 'next';
import { Suspense } from 'react';

import PublicShellFrame from '@/app/(root)/components/PublicShellFrame';

import DepositPageClient from './DepositPageClient';

export const metadata: Metadata = {
  title: 'Bitcode Deposits',
  description:
    'Connect repository source, synthesize source-safe AssetPack deposit options, review measurements, and submit source supply into Bitcode.',
  alternates: {
    canonical: '/deposits',
  },
};

export default function DepositPage() {
  return (
    <PublicShellFrame>
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#02050d] px-4 pb-24 pt-32 text-neutral-100 tablet:px-6 desktop:px-8">
            <div className="border border-white/10 bg-white/[0.03] px-6 py-10 text-sm text-neutral-300">
              Loading Depositing...
            </div>
          </main>
        }
      >
        <DepositPageClient />
      </Suspense>
    </PublicShellFrame>
  );
}

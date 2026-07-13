import type { Metadata } from 'next';
import { Suspense } from 'react';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';

import ReadPageClient from '@/components/reads/ReadPageClient/ReadPageClient';

export const metadata: Metadata = {
  title: 'Bitcode Reads',
  description:
    'Request Reading, review synthesized Needs, request Finding Fits, inspect source-safe AssetPack previews, and settle for delivery.',
  alternates: {
    canonical: '/reads',
  },
};

export default function ReadPage() {
  return (
    <PublicShellFrame>
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#02050d] px-4 pb-24 pt-32 text-neutral-100 tablet:px-6 desktop:px-8">
            <div className="border border-white/10 bg-white/[0.03] px-6 py-10 text-sm text-neutral-300">
              Loading Reading...
            </div>
          </main>
        }
      >
        <ReadPageClient />
      </Suspense>
    </PublicShellFrame>
  );
}

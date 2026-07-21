/**
 * Exchange experience — durable AssetPack activity / market reread.
 * Canonical product route (retired product name: Packs).
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';
import PacksPageClient from '@/components/packs/PacksPageClient/PacksPageClient';
import { EXCHANGE_ROUTE } from '@/components/bitcode/routes/ProductRoutes/product-routes';

export const metadata: Metadata = {
  title: 'Bitcode Exchange',
  description:
    'Search exchange activity, inspect source-safe measurements, proof roots, settlement, compensation, delivery, and repair state.',
  alternates: {
    canonical: EXCHANGE_ROUTE,
  },
};

export default function ExchangePage() {
  return (
    <PublicShellFrame>
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#02050d] px-4 pb-24 pt-32 text-neutral-100 tablet:px-6 desktop:px-8">
            <div className="border border-white/10 bg-white/[0.03] px-6 py-10 text-sm text-neutral-300">
              Loading exchange activity...
            </div>
          </main>
        }
      >
        <PacksPageClient />
      </Suspense>
    </PublicShellFrame>
  );
}

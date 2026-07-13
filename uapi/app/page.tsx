import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';
import MarketingLandingPage from '@/components/marketing/MarketingLandingPage/MarketingLandingPage';
import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export const metadata: Metadata = {
  title: 'Bitcode',
  description:
    'Bitcode public home for AssetPacks, BTD scalar volume and rights, BTC settlement, proof readback, /deposits, /reads, /packs, and docs.',
  alternates: {
    canonical: '/',
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

function appendSearchParams(target: URLSearchParams, searchParams: SearchParams) {
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry) target.append(key, entry);
      }
    } else if (value) {
      target.set(key, value);
    }
  }
}

function hasSupabaseCallbackParams(searchParams: SearchParams) {
  return Boolean(searchParams.code || searchParams.token_hash || searchParams.error || searchParams.error_description);
}

export default function Home({ searchParams = {} }: { searchParams?: SearchParams }) {
  if (hasSupabaseCallbackParams(searchParams)) {
    const params = new URLSearchParams();
    appendSearchParams(params, searchParams);
    if (!params.has('next')) params.set('next', buildAuxillariesRoutePath('wallet'));
    redirect(`/tps/supabase/callback?${params.toString()}`);
  }

  return (
    <PublicShellFrame>
      <MarketingLandingPage />
    </PublicShellFrame>
  );
}

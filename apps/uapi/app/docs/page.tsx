import { access } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';
import PublicDocsPageContent from '@/components/marketing/PublicDocsPageContent/PublicDocsPageContent';
import { MARKETING_OPERATOR_GUIDE_SOURCE } from '@/components/marketing/MarketingOperatorGuideAssets/marketing-operator-guide-assets';

export const metadata: Metadata = {
  title: 'Bitcode Docs',
  description:
    'Learn Bitcode from AssetPacks, /packs, /reads, /deposits, proofs, settlement, Auxillaries, MCP/API, ChatGPT App, and connected interfaces.',
  alternates: {
    canonical: '/docs',
  },
};

async function resolveOperatorGuideSourcePlayable() {
  try {
    await access(path.join(process.cwd(), MARKETING_OPERATOR_GUIDE_SOURCE.relativeSourcePath));
    return true;
  } catch {
    return false;
  }
}

export default async function DocsPage() {
  const sourcePlayable = await resolveOperatorGuideSourcePlayable();

  return (
    <PublicShellFrame>
      <PublicDocsPageContent sourcePlayable={sourcePlayable} />
    </PublicShellFrame>
  );
}

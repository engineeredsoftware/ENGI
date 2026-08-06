import { access } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';
import PublicDocsPageContent from '@/components/marketing/PublicDocsPageContent/PublicDocsPageContent';
import { MARKETING_OPERATOR_GUIDE_SOURCE } from '@/components/marketing/MarketingOperatorGuideAssets/marketing-operator-guide-assets';

export const metadata: Metadata = {
  title: 'Bitcode Docs',
  description:
    'Redirect path into the Bitcode docs hub, including the walkthrough, inline widgets, and direct links into live transactions.',
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

export default async function OperatorGuidePage() {
  const sourcePlayable = await resolveOperatorGuideSourcePlayable();

  return (
    <PublicShellFrame>
      <PublicDocsPageContent sourcePlayable={sourcePlayable} />
    </PublicShellFrame>
  );
}

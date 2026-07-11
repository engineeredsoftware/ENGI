import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';

import DocsArticlePage from '../DocsArticlePage';
import { BITCODE_DOCS_PAGE_SLUGS, getBitcodeDocsPage } from '../bitcode-docs-content';

type DocsRouteProps = {
  params: {
    slug: string;
  };
};

const DOCS_ROUTE_ALIASES: Record<string, string> = {
  'protocol-v26': 'protocol',
};

function resolveDocsSlug(slug: string) {
  return DOCS_ROUTE_ALIASES[slug] ?? slug;
}

export function generateStaticParams() {
  return BITCODE_DOCS_PAGE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: DocsRouteProps): Metadata {
  const page = getBitcodeDocsPage(resolveDocsSlug(params.slug));

  if (!page) {
    return {
      title: 'Bitcode Docs',
    };
  }

  return {
    title: `${page.title} | Bitcode Docs`,
    description: page.summary,
    alternates: {
      canonical: page.href,
    },
  };
}

export default function DocsRoutePage({ params }: DocsRouteProps) {
  const resolvedSlug = resolveDocsSlug(params.slug);

  if (resolvedSlug !== params.slug) {
    redirect(`/docs/${resolvedSlug}`);
  }

  const page = getBitcodeDocsPage(resolvedSlug);

  if (!page) {
    notFound();
  }

  return (
    <PublicShellFrame>
      <DocsArticlePage page={page} />
    </PublicShellFrame>
  );
}

/**
 * Contextual next-reading CTAs after certain docs articles.
 */
import React from 'react';
import Link from 'next/link';
import type { BitcodeDocsPage } from '@/components/docs/models/bitcode-docs-types';

export function DocsNextReadingCards({ page }: { page: BitcodeDocsPage }) {
  if (page.slug === 'terminal') {
    return (
      <div className="grid gap-4 tablet:grid-cols-2">
        <Link
          href="/docs/product-actions"
          className="rounded-none border border-emerald-300/14 bg-emerald-400/[0.06] p-5 transition hover:border-emerald-300/28 hover:bg-emerald-400/[0.1]"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/70">Next</p>
          <p className="mt-2 text-xl font-semibold text-white">Read every Terminal write action</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Continue into the action manual when you want exact operator writes and expected results.
          </p>
        </Link>
        <Link
          href="/docs/read-results"
          className="rounded-none border border-cyan-300/14 bg-cyan-400/[0.05] p-5 transition hover:border-cyan-300/28 hover:bg-cyan-400/[0.09]"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">Audit</p>
          <p className="mt-2 text-xl font-semibold text-white">Read proofs and readiness</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Move to read surfaces when you read to verify state before trusting the flow.
          </p>
        </Link>
      </div>
    );
  }

  return null;
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/**
 * Legacy executions corridor — product history lives on /exchange and /deposits|/reads.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */
export const metadata: Metadata = {
  title: 'Bitcode Pipelines',
  alternates: { canonical: '/exchange' },
  robots: { index: false, follow: true },
};

export default function ExecutionsRedirectPage() {
  redirect('/exchange');
}

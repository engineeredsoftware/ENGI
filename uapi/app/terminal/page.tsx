import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/**
 * Legacy /terminal cockpit is eradicated. Preserve query string (e.g.
 * auxillary-open-to, transactionId) onto /packs.
 * @see BITCODE_SPEC_V48.md § Legacy Terminal eradication
 */
export const metadata: Metadata = {
  title: 'Bitcode Packs',
  alternates: { canonical: '/packs' },
  robots: { index: false, follow: true },
};

type TerminalRedirectPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function TerminalRedirectPage({ searchParams }: TerminalRedirectPageProps) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === 'string') params.set(key, value);
      else if (Array.isArray(value)) {
        for (const item of value) params.append(key, item);
      }
    }
  }
  const query = params.toString();
  redirect(query ? `/packs?${query}` : '/packs');
}

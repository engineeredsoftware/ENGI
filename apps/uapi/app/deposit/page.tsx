import { permanentRedirect } from 'next/navigation';

// Compatibility shim: the Deposits product route moved from /deposit to
// /deposits (V48). Old links and in-flight auth next-paths land here and are
// forwarded with their query intact.
type DepositCompatibilityPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function serializeSearchParams(searchParams: DepositCompatibilityPageProps['searchParams']) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    if (Array.isArray(value)) {
      value.forEach((entry) => next.append(key, entry));
    } else if (value !== undefined) {
      next.set(key, value);
    }
  }
  const query = next.toString();
  return query ? `?${query}` : '';
}

export default function DepositCompatibilityPage({ searchParams }: DepositCompatibilityPageProps) {
  permanentRedirect(`/deposits${serializeSearchParams(searchParams)}`);
}

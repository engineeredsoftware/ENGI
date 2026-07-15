import { redirect } from 'next/navigation';

type ExchangeCompatibilityPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function serializeSearchParams(searchParams: ExchangeCompatibilityPageProps['searchParams']) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams || {})) {
    if (Array.isArray(value)) {
      value.forEach((entry) => next.append(key, entry));
    } else if (value) {
      next.set(key, value);
    }
  }
  const query = next.toString();
  return query ? `?${query}` : '';
}

export default function ExchangeCompatibilityPage({ searchParams }: ExchangeCompatibilityPageProps) {
  redirect(`/packs${serializeSearchParams(searchParams)}`);
}

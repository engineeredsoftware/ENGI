import { permanentRedirect } from 'next/navigation';

// Compatibility shim: the Reads product route moved from /read to /reads
// (V48). Old links and in-flight auth next-paths land here and are forwarded
// with their query intact.
type ReadCompatibilityPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function serializeSearchParams(searchParams: ReadCompatibilityPageProps['searchParams']) {
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

export default function ReadCompatibilityPage({ searchParams }: ReadCompatibilityPageProps) {
  permanentRedirect(`/reads${serializeSearchParams(searchParams)}`);
}

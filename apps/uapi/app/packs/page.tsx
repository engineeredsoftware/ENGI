/**
 * Compatibility: retired product path `/exchange` → canonical Exchange `/exchange`.
 * Commodity language AssetPack is unchanged; only the product experience name moved.
 */

import { redirect } from 'next/navigation';

import { EXCHANGE_ROUTE } from '@/components/bitcode/routes/ProductRoutes/product-routes';

type PacksCompatibilityPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function serializeSearchParams(searchParams: PacksCompatibilityPageProps['searchParams']) {
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

export default function PacksCompatibilityPage({ searchParams }: PacksCompatibilityPageProps) {
  redirect(`${EXCHANGE_ROUTE}${serializeSearchParams(searchParams)}`);
}

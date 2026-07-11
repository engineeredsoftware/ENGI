import type { Metadata } from 'next';
import Link from 'next/link';

import PublicShellFrame from '@/components/marketing/PublicShellFrame/PublicShellFrame';

type BtdRangePageProps = {
  params: {
    assetPackId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

function readScalar(
  searchParams: BtdRangePageProps['searchParams'],
  key: string,
  fallback = 'Pending',
) {
  const value = searchParams?.[key];
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }
  return value || fallback;
}

function readNumber(searchParams: BtdRangePageProps['searchParams'], key: string) {
  const value = readScalar(searchParams, key, '');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatRange(searchParams: BtdRangePageProps['searchParams']) {
  const start = readNumber(searchParams, 'rangeStart');
  const endExclusive = readNumber(searchParams, 'rangeEndExclusive');

  if (typeof start === 'number' && typeof endExclusive === 'number' && endExclusive > start) {
    return `${start.toLocaleString()}-${(endExclusive - 1).toLocaleString()}`;
  }

  return 'Range pending';
}

function assetPackLabel(assetPackId: string) {
  const decoded = decodeURIComponent(assetPackId);
  return decoded.length > 28 ? `${decoded.slice(0, 18)}...${decoded.slice(-8)}` : decoded;
}

export function generateMetadata({ params }: BtdRangePageProps): Metadata {
  const label = assetPackLabel(params.assetPackId);

  return {
    title: `${label} | Bitcode $BTD Range`,
    description:
      'Bitcode AssetPack range disclosure for $BTD ownership, access policy, owner-read, licensed-read, and Exchange transfer posture.',
    alternates: {
      canonical: `/btd/${encodeURIComponent(params.assetPackId)}`,
    },
  };
}

export default function BtdRangePage({ params, searchParams }: BtdRangePageProps) {
  const assetPackId = decodeURIComponent(params.assetPackId);
  const range = formatRange(searchParams);
  const policyId = readScalar(searchParams, 'policyId', 'Policy id pending');
  const policyHash = readScalar(searchParams, 'policyHash', 'Policy hash pending');
  const readBranch = readScalar(searchParams, 'readBranch', 'Owner-read / licensed-read');
  const proofRoot = readScalar(searchParams, 'proofRoot', 'Proof root pending');
  const sourceManifestRoot = readScalar(searchParams, 'sourceManifestRoot', 'Source manifest root pending');

  return (
    <PublicShellFrame>
      <main className="min-h-screen bg-[#02050d] px-4 pb-24 pt-32 text-neutral-100 tablet:px-6 desktop:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <section className="grid gap-5 border-b border-white/10 pb-8 laptop:grid-cols-[1.2fr_0.8fr] laptop:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                $BTD AssetPack Range
              </p>
              <h1 className="break-words text-3xl font-semibold tracking-normal text-white laptop:text-5xl">
                {assetPackLabel(assetPackId)}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-300 laptop:text-base">
                This page reads one Bitcode AssetPack range as a non-fungible source-share and read-right
                object. BTC remains the fee asset; $BTD remains the measured share/read-right posture.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 laptop:justify-end">
              <Link
                href={`/packs?assetPack=${encodeURIComponent(assetPackId)}&intent=buy-existing-btd`}
                className="inline-flex items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50 transition-colors hover:border-emerald-300/55 hover:bg-emerald-400/18"
              >
                Open Packs
              </Link>
              <Link
                href="/reads?intent=submit-read-for-btd"
                className="inline-flex items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-50 transition-colors hover:border-sky-300/50 hover:bg-sky-400/16"
              >
                Open Read
              </Link>
            </div>
          </section>

          <section className="grid gap-4 laptop:grid-cols-4">
            {[
              ['AssetPack range', range, 'Contiguous $BTD cells are the commercial transfer object.'],
              ['Access policy', policyId, 'Owner-read and licensed-read are evaluated by policy id.'],
              ['Policy hash', policyHash, 'Private source access must match the immutable policy hash.'],
              ['Read branch', readBranch, 'Ownership and licensed-read posture stay separate.'],
            ].map(([label, value, detail]) => (
              <article key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {label}
                </p>
                <p className="mt-3 break-words text-lg font-semibold text-white">{value}</p>
                <p className="mt-3 text-sm leading-6 text-neutral-400">{detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 laptop:grid-cols-2">
            <article className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Proof root
              </p>
              <p className="mt-3 break-words font-mono text-sm text-emerald-100">{proofRoot}</p>
            </article>
            <article className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Source manifest root
              </p>
              <p className="mt-3 break-words font-mono text-sm text-sky-100">{sourceManifestRoot}</p>
            </article>
          </section>
        </div>
      </main>
    </PublicShellFrame>
  );
}

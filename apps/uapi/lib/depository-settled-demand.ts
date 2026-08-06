/**
 * Load settled / admitted Depository DataPacks and estimate demand for deposit
 * earnings (source-safe metadata only).
 *
 * Also maps packs into DepositoryAsset shape for Discovery search (lexical +
 * optional vector) on both deposit relevants and read need-fits.
 *
 * Dispatch preload: call `loadDepositorySearchAssets` before SDIVF Discovery so
 * `depository.settledAssets` / `deposit.settledDepositoryAssets` are non-empty
 * when supply exists (finding APs is critical for read Need-fits).
 */

import { supabaseAdmin } from '@bitcode/supabase';
import {
  estimateDepositorySettledDemand,
  settledDemandEstimateToSignals,
  type DepositorySettledDemandEstimate,
  type SettledDepositoryPackSummary,
} from '@bitcode/asset-packs-pipelines-syntheses-domain';
import type { DepositoryAsset } from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-search';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim());
}

function packFromExecutionRow(row: Record<string, unknown>): SettledDepositoryPackSummary | null {
  const id = asString(row.id);
  if (!id) return null;
  const context = asRecord(row.context) || {};
  const output = asRecord(row.output) || {};
  const admission =
    asString(context.admissionState) ||
    asString(context.admission) ||
    asString(output.admissionState);
  const settlement =
    asString(context.settlementState) ||
    asString(asRecord(output.ledgerSettlement)?.status) ||
    asString(asRecord(output.settlement)?.status);
  const lifecycle =
    settlement === 'settled' || asString(row.type)?.includes('settled')
      ? 'settled'
      : admission === 'admitted-to-depository'
        ? 'admitted-to-depository'
        : asString(row.status);

  // Only admit settled packs or depository-admitted supply (not raw pipeline runs).
  const admitted =
    lifecycle === 'settled' ||
    lifecycle === 'admitted-to-depository' ||
    // dual-compat: settled-assetpack | settled-datapack
    asString(row.type) === 'settled-assetpack' ||
    asString(row.type) === 'settled-datapack' ||
    asString(context.source) === 'deposit-option-review-admission';
  if (!admitted) return null;

  const depositOption = asRecord(output.depositOption) || asRecord(output.option);
  const assetPack = asRecord(output.assetPack);
  const title =
    asString(output.title) ||
    asString(output.assetPackTitle) ||
    asString(depositOption?.title) ||
    asString(assetPack?.title) ||
    asString(row.summary);
  const summary =
    asString(output.summary) ||
    asString(depositOption?.summary) ||
    asString(assetPack?.summary);
  const kind =
    asString(output.kind) ||
    asString(output.assetPackKind) ||
    asString(output.optionKind) ||
    asString(depositOption?.kind) ||
    asString(assetPack?.kind) ||
    asString(context.optionKind) ||
    asString(context.assetPackKind);
  const repositoryFullName =
    asString(context.repositoryFullName) ||
    asString(asRecord(output.sourceBinding)?.repositoryFullName) ||
    asString(asRecord(depositOption?.sourceBinding)?.repositoryFullName) ||
    asString(asRecord(assetPack?.sourceBinding)?.repositoryFullName);
  const topics = [
    ...asStringArray(output.topics),
    ...asStringArray(depositOption?.topics),
    ...asStringArray(context.topics),
  ];
  const coveredSourcePaths = [
    ...asStringArray(output.coveredSourcePaths),
    ...asStringArray(depositOption?.coveredSourcePaths),
    ...asStringArray(assetPack?.coveredSourcePaths),
  ];

  return {
    id,
    title,
    summary,
    kind,
    repositoryFullName,
    lifecycleState: lifecycle,
    topics: [...new Set(topics)].slice(0, 24),
    // Extra fields carried for search mapping (typed loosely on summary).
    ...(coveredSourcePaths.length ? { coveredSourcePaths } : {}),
  } as SettledDepositoryPackSummary & { coveredSourcePaths?: string[] };
}

/**
 * Map a settled/admitted pack summary into a DepositoryAsset for lexical/vector
 * search. Source-safe text only — no raw source bodies.
 * Prefer commercial NL when present (primary search surface).
 */
export function settledPackToDepositoryAsset(
  pack: SettledDepositoryPackSummary & {
    coveredSourcePaths?: string[] | null;
    absoluteKinds?: string[] | null;
    absoluteVolumes?: Record<string, number> | null;
    commercialTitle?: string | null;
    commercialDescription?: string | null;
    absoluteFixtures?: Array<{
      measurementKind: string;
      label?: string;
      descriptor?: string;
      volume: number;
      status?: string;
    }> | null;
  },
): DepositoryAsset {
  const commercialTitle =
    typeof pack.commercialTitle === 'string' && pack.commercialTitle.trim()
      ? pack.commercialTitle.trim()
      : '';
  const commercialDescription =
    typeof pack.commercialDescription === 'string' && pack.commercialDescription.trim()
      ? pack.commercialDescription.trim()
      : '';
  const title = commercialTitle || pack.title || pack.id;
  const summary = commercialDescription || pack.summary || '';
  const topics = Array.isArray(pack.topics) ? pack.topics.filter(Boolean) : [];
  const paths = Array.isArray(pack.coveredSourcePaths)
    ? pack.coveredSourcePaths.filter(Boolean).slice(0, 40)
    : [];
  const absoluteKinds = Array.isArray(pack.absoluteKinds)
    ? pack.absoluteKinds.filter(Boolean)
    : [];
  const absoluteVolumes =
    pack.absoluteVolumes && typeof pack.absoluteVolumes === 'object'
      ? pack.absoluteVolumes
      : {};
  const fixtures = Array.isArray(pack.absoluteFixtures) ? pack.absoluteFixtures : [];
  const fixtureLines = fixtures
    .slice(0, 32)
    .map((f) => {
      const head = f.label || f.measurementKind;
      const vol = Number.isFinite(f.volume) ? f.volume.toFixed(3) : '0';
      return f.descriptor ? `${head}: ${f.descriptor} (${vol})` : `${head}:${vol}`;
    })
    .join(' ');
  const volumePairs = Object.entries(absoluteVolumes)
    .filter(([, v]) => Number.isFinite(Number(v)) && Number(v) > 0)
    .map(([k, v]) => `${k}:${Number(v).toFixed(3)}`)
    .slice(0, 40);
  const contentUnits: DepositoryAsset['contentUnits'] = [];
  if (commercialTitle || commercialDescription) {
    contentUnits.push({
      unitId: `${pack.id}:commercial`,
      unitKind: 'commercial-nl',
      text: [commercialTitle, commercialDescription].filter(Boolean).join(' '),
    });
  }
  if (pack.summary && pack.summary !== commercialDescription) {
    contentUnits.push({
      unitId: `${pack.id}:summary`,
      unitKind: 'summary',
      text: pack.summary,
    });
  }
  if (fixtureLines || volumePairs.length) {
    contentUnits.push({
      unitId: `${pack.id}:absolutes`,
      unitKind: 'absolute-fixtures',
      text: [fixtureLines, ...volumePairs].filter(Boolean).join(' '),
    });
  }
  if (paths.length) {
    contentUnits.push({
      unitId: `${pack.id}:paths`,
      unitKind: 'paths',
      text: paths.join(' '),
    });
  }
  if (contentUnits.length === 0) {
    contentUnits.push({
      unitId: `${pack.id}:summary`,
      unitKind: 'summary',
      text: title,
    });
  }

  return {
    assetId: pack.id,
    title,
    summary,
    artifactKind: pack.kind || 'asset-pack',
    repositoryFullName: pack.repositoryFullName || null,
    contentUnits,
    metadata: {
      lifecycleState: pack.lifecycleState || null,
      topics,
      coveredSourcePaths: paths,
      absoluteKinds,
      absoluteVolumes,
      absoluteFixtures: fixtures,
      commercialTitle: commercialTitle || null,
      commercialDescription: commercialDescription || null,
      sourceSafe: true,
    },
    // Measurement evidence only when absolute facets are present — never force true.
    hasAssetMeasurementEvidence:
      absoluteKinds.length > 0 || Object.keys(absoluteVolumes).length > 0,
    hasWalletOrAttestationProof: false,
  };
}

/**
 * Prefer indexed depository_search_documents (65-kind absolute facets) when present;
 * fall back to admitted execution activity rows.
 */
export async function loadDepositorySearchAssets(limit = 120): Promise<DepositoryAsset[]> {
  // Cap raised (was 100) so lexical corpus better covers larger depositories while
  // vector RPC can still surface ids beyond the preload for hybrid merge.
  const cap = Math.min(Math.max(limit, 1), 200);
  try {
    const { data, error } = await supabaseAdmin
      .from('depository_search_documents')
      .select(
        'asset_id, title, summary, commercial_title, commercial_description, kind, repository_full_name, lifecycle, topics, absolute_kinds, absolute_volumes, absolute_fixtures, source_path_tokens',
      )
      .order('updated_at', { ascending: false })
      .limit(cap);
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row) =>
        settledPackToDepositoryAsset({
          id: String(row.asset_id),
          title: asString(row.title),
          summary: asString(row.summary),
          commercialTitle: asString(row.commercial_title),
          commercialDescription: asString(row.commercial_description),
          kind: asString(row.kind),
          repositoryFullName: asString(row.repository_full_name),
          lifecycleState: asString(row.lifecycle) || 'admitted-to-depository',
          topics: asStringArray(row.topics),
          coveredSourcePaths: asStringArray(row.source_path_tokens),
          absoluteKinds: asStringArray(row.absolute_kinds),
          absoluteVolumes:
            row.absolute_volumes && typeof row.absolute_volumes === 'object'
              ? (row.absolute_volumes as Record<string, number>)
              : {},
          absoluteFixtures: Array.isArray(row.absolute_fixtures)
            ? (row.absolute_fixtures as Array<{
                measurementKind: string;
                label?: string;
                descriptor?: string;
                volume: number;
                status?: string;
              }>)
            : [],
        }),
      );
    }
  } catch {
    /* fall through to executions */
  }

  const packs = await loadSettledDepositoryPacks(cap);
  return packs.map((pack) =>
    settledPackToDepositoryAsset(
      pack as SettledDepositoryPackSummary & { coveredSourcePaths?: string[] },
    ),
  );
}

/**
 * Query the Depository for settled / admitted AssetPack execution rows.
 * Fail-soft: returns [] on error so callers mark demand unestimatable.
 */
export async function loadSettledDepositoryPacks(
  limit = 80,
): Promise<SettledDepositoryPackSummary[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('executions')
      .select('id, created_at, status, type, output, context')
      .or(
        [
          'context->>admissionState.eq.admitted-to-depository',
          'context->>source.eq.deposit-option-review-admission',
          // dual-compat: AssetPack → DataPack activity type ids
          'type.eq.settled-assetpack',
          'type.eq.settled-datapack',
          'context->>settlementState.eq.settled',
        ].join(','),
      )
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (error || !Array.isArray(data)) return [];
    const packs: SettledDepositoryPackSummary[] = [];
    const seen = new Set<string>();
    for (const row of data) {
      const pack = packFromExecutionRow(row as Record<string, unknown>);
      if (!pack || seen.has(pack.id)) continue;
      seen.add(pack.id);
      packs.push(pack);
    }
    return packs;
  } catch {
    return [];
  }
}

export async function loadDepositorySettledDemandEstimate(input?: {
  focus?: {
    title?: string | null;
    summary?: string | null;
    kind?: string | null;
    repositoryFullName?: string | null;
    coveredSourcePaths?: string[] | null;
  } | null;
  repositoryFullName?: string | null;
  minSettledPacks?: number;
}): Promise<DepositorySettledDemandEstimate> {
  const settledPacks = await loadSettledDepositoryPacks(80);
  return estimateDepositorySettledDemand({
    settledPacks,
    focus: input?.focus || {
      repositoryFullName: input?.repositoryFullName || null,
    },
    minSettledPacks: input?.minSettledPacks,
  });
}

export { settledDemandEstimateToSignals, estimateDepositorySettledDemand };
export type { DepositorySettledDemandEstimate, SettledDepositoryPackSummary };

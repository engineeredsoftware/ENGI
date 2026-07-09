/**
 * Load settled / admitted Depository AssetPacks and estimate demand for deposit
 * earnings (source-safe metadata only).
 */

import { supabaseAdmin } from '@bitcode/supabase';
import {
  estimateDepositorySettledDemand,
  settledDemandEstimateToSignals,
  type DepositorySettledDemandEstimate,
  type SettledDepositoryPackSummary,
} from '@bitcode/pipeline-asset-pack';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
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
    asString(row.type) === 'settled-assetpack' ||
    asString(context.source) === 'deposit-option-review-admission';
  if (!admitted) return null;

  const title =
    asString(output.title) ||
    asString(asRecord(output.depositOption)?.title) ||
    asString(asRecord(output.assetPack)?.title) ||
    asString(row.summary);
  const summary =
    asString(output.summary) ||
    asString(asRecord(output.depositOption)?.summary) ||
    asString(asRecord(output.assetPack)?.summary);
  const kind =
    asString(output.kind) ||
    asString(asRecord(output.depositOption)?.kind) ||
    asString(asRecord(output.assetPack)?.kind) ||
    asString(context.optionKind);
  const repositoryFullName =
    asString(context.repositoryFullName) ||
    asString(asRecord(output.sourceBinding)?.repositoryFullName) ||
    asString(asRecord(output.depositOption)?.sourceBinding &&
      asRecord(asRecord(output.depositOption)?.sourceBinding)?.repositoryFullName);

  return {
    id,
    title,
    summary,
    kind,
    repositoryFullName,
    lifecycleState: lifecycle,
    topics: [],
  };
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
      .select('id, created_at, status, type, output, context, summary')
      .or(
        [
          'context->>admissionState.eq.admitted-to-depository',
          'context->>source.eq.deposit-option-review-admission',
          'type.eq.settled-assetpack',
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

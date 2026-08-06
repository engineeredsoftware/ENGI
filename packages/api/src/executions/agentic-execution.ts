export type AgenticExecutionLens = 'deposit' | 'read' | 'closure';

export interface AgenticExecutionSummary {
  canonicalType: string;
  family:
    | 'asset-pack'
    | 'read-measurement'
    | 'proof-refresh'
    | 'upgrade'
    | 'agentic-execution';
  label: string;
  lens: AgenticExecutionLens;
  proofStatus: string;
  closureFocus: string;
}

const DEFAULT_CANONICAL_TYPE = 'agentic-execution:asset-pack' as const;
const DEFAULT_STORAGE_TYPE = DEFAULT_CANONICAL_TYPE;

const CANONICAL_TO_STORAGE_TYPE = {
  'agentic-execution:asset-pack': 'agentic-execution:asset-pack',
  'agentic-execution:read-measurement': 'pipeline:measure',
  'agentic-execution:proof-refresh': 'pipeline:proof-refresh',
  'agentic-execution:upgrade': 'pipeline:upgrades',
} as const;

type CanonicalAgenticExecutionType = keyof typeof CANONICAL_TO_STORAGE_TYPE;

function normalizeWhitespace(value?: string | null) {
  return value?.trim() || '';
}

export function normalizeAgenticExecutionType(value?: string | null) {
  const normalized = normalizeWhitespace(value).toLowerCase();

  if (!normalized) return DEFAULT_CANONICAL_TYPE;
  if (normalized.startsWith('agentic-execution:')) {
    if (normalized === 'agentic-execution:branch-artifact') return 'agentic-execution:asset-pack';
    return normalized in CANONICAL_TO_STORAGE_TYPE
      ? (normalized as CanonicalAgenticExecutionType)
      : DEFAULT_CANONICAL_TYPE;
  }
  if (normalized.includes('upgrade')) return 'agentic-execution:upgrade';
  if (normalized.includes('proof')) return 'agentic-execution:proof-refresh';
  if (normalized.includes('measure')) return 'agentic-execution:read-measurement';
  if (
    normalized.includes('asset-pack') ||
    normalized.includes('asset_pack') ||
    normalized.includes('settle') ||
    normalized.includes('artifact')
  ) {
    return 'agentic-execution:asset-pack';
  }

  return DEFAULT_CANONICAL_TYPE;
}

export function normalizeAgenticExecutionStorageType(value?: string | null) {
  const normalized = normalizeWhitespace(value).toLowerCase();

  if (!normalized) return DEFAULT_STORAGE_TYPE;
  const canonicalType = normalizeAgenticExecutionType(normalized);
  return CANONICAL_TO_STORAGE_TYPE[canonicalType] ?? DEFAULT_STORAGE_TYPE;
}

export function resolveAgenticExecutionQueryTypes(value?: string | null) {
  const normalized = normalizeWhitespace(value).toLowerCase();

  if (!normalized) return [];

  if (normalized.startsWith('pipeline:')) {
    return Array.from(
      new Set([normalized, normalizeAgenticExecutionType(normalized)]),
    );
  }

  const canonicalType = normalizeAgenticExecutionType(normalized);
  return Array.from(
    new Set([canonicalType, normalizeAgenticExecutionStorageType(canonicalType)]),
  );
}

export function formatAgenticExecutionLabel(value?: string | null) {
  const canonicalType = normalizeAgenticExecutionType(value);

  switch (canonicalType) {
    case 'agentic-execution:read-measurement':
      return 'read measurement execution';
    case 'agentic-execution:proof-refresh':
      return 'proof refresh execution';
    case 'agentic-execution:upgrade':
      return 'upgrade execution';
    case 'agentic-execution:asset-pack':
    default:
      return 'AssetPack execution';
  }
}

export function deriveAgenticExecutionLens(value?: string | null): AgenticExecutionLens {
  const canonicalType = normalizeAgenticExecutionType(value);

  switch (canonicalType) {
    case 'agentic-execution:read-measurement':
      return 'read';
    case 'agentic-execution:proof-refresh':
    case 'agentic-execution:upgrade':
      return 'closure';
    case 'agentic-execution:asset-pack':
    default:
      return 'deposit';
  }
}

export function deriveAgenticExecutionClosureFocus(value?: string | null) {
  const canonicalType = normalizeAgenticExecutionType(value);

  switch (canonicalType) {
    case 'agentic-execution:read-measurement':
      return 'read measurement + verification posture';
    case 'agentic-execution:proof-refresh':
      return 'proof-family refresh + operating posture';
    case 'agentic-execution:upgrade':
      return 'upgrade closure + delivery posture';
    case 'agentic-execution:asset-pack':
    default:
      return 'AssetPacks + settlement delivery';
  }
}

/**
 * Optional recovery / partial-completion hints from executions.context|output.
 * Host budget recovery (run 8ecbd11a) used to leave status=completed so the
 * table showed "AssetPack bundle ready" even when Validation was truncated.
 */
export type AgenticExecutionProofHints = {
  hostBudgetExceeded?: boolean | null;
  partial?: boolean | null;
  hostRecoveredFromTimeout?: boolean | null;
  hostResultState?: string | null;
  /** Validation ReadyToFinish did not approve (options may still exist). */
  validationNotReady?: boolean | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** Read partial/budget hints from execution context and/or output records. */
export function readAgenticExecutionProofHints(
  context?: unknown,
  output?: unknown,
): AgenticExecutionProofHints {
  const ctx = asRecord(context);
  const out = asRecord(output);
  const summary = String(out?.summary || ctx?.summary || '');
  const hostBudgetExceeded =
    asBoolean(ctx?.hostBudgetExceeded) ||
    asBoolean(out?.hostBudgetExceeded) ||
    asBoolean(ctx?.hostRecoveredFromTimeout) ||
    asBoolean(out?.hostRecoveredFromTimeout) ||
    /host budget|host runtime budget|PipelineHostTimeout/i.test(summary);
  const validationNotReady =
    asBoolean(ctx?.validationNotReady) ||
    asBoolean(out?.validationNotReady) ||
    ctx?.validationReadyToFinish === false ||
    out?.validationReadyToFinish === false ||
    /Validation ReadyToFinish not ready|Deposit synthesis not ready/i.test(summary);
  const partial =
    asBoolean(ctx?.partial) ||
    asBoolean(out?.partial) ||
    asBoolean(ctx?.hostPartial) ||
    hostBudgetExceeded ||
    validationNotReady ||
    /recovered \d+ measured AssetPack options/i.test(summary);
  const hostResultState =
    (typeof ctx?.hostResultState === 'string' && ctx.hostResultState) ||
    (typeof out?.hostResultState === 'string' && out.hostResultState) ||
    null;
  return {
    hostBudgetExceeded,
    partial,
    hostRecoveredFromTimeout: hostBudgetExceeded,
    hostResultState,
    validationNotReady,
  };
}

/**
 * Display status for the transactions table. Demotes stored `completed` to
 * `partial` when recovery/validation-not-ready hints are present so historical
 * rows never wear a green COMPLETED costume after soft failure (8ecbd11a,
 * 49a2630b).
 */
export function deriveDisplayExecutionStatus(
  status?: string | null,
  context?: unknown,
  output?: unknown,
  hints?: AgenticExecutionProofHints | null,
): string {
  const raw = normalizeWhitespace(status) || 'running';
  const resolved = hints || readAgenticExecutionProofHints(context, output);
  const lower = raw.toLowerCase();
  if (
    (lower === 'completed' || lower === 'complete') &&
    (resolved.partial ||
      resolved.hostBudgetExceeded ||
      resolved.hostRecoveredFromTimeout ||
      resolved.validationNotReady)
  ) {
    return 'partial';
  }
  return raw;
}

export function deriveAgenticExecutionProofStatus(
  value?: string | null,
  status?: string | null,
  hints?: AgenticExecutionProofHints | null,
) {
  const canonicalType = normalizeAgenticExecutionType(value);
  const displayStatus = deriveDisplayExecutionStatus(status, null, null, hints);
  const normalizedStatus = normalizeWhitespace(displayStatus).toLowerCase();
  const budgetPartial =
    Boolean(hints?.hostBudgetExceeded) || Boolean(hints?.hostRecoveredFromTimeout);
  const isPartialStatus =
    normalizedStatus === 'partial' ||
    normalizedStatus === 'completed_partial' ||
    Boolean(hints?.partial) ||
    Boolean(hints?.validationNotReady);

  // Budget-recovered deposit options: usable packs, Validation/Finish not closed.
  const isAssetPackExecution = canonicalType === 'agentic-execution:asset-pack';
  if (
    budgetPartial &&
    isAssetPackExecution &&
    (normalizedStatus === 'completed' ||
      normalizedStatus === 'partial' ||
      normalizedStatus === 'completed_partial' ||
      !normalizedStatus)
  ) {
    return 'AssetPack options recovered (host budget)';
  }

  if (isAssetPackExecution && hints?.validationNotReady && isPartialStatus) {
    return 'AssetPack options (Validation not ready)';
  }

  if (isAssetPackExecution && isPartialStatus) {
    return 'AssetPack options partial';
  }

  if (normalizedStatus === 'completed') {
    switch (canonicalType) {
      case 'agentic-execution:read-measurement':
        return 'read-measurement witness ready';
      case 'agentic-execution:proof-refresh':
        return 'proof witness ready';
      case 'agentic-execution:upgrade':
        return 'upgrade closure ready';
      case 'agentic-execution:asset-pack':
      default:
        return 'AssetPack bundle ready';
    }
  }

  if (normalizedStatus === 'error' || normalizedStatus === 'failed') {
    return 'agentic execution failed closed';
  }

  switch (canonicalType) {
    case 'agentic-execution:read-measurement':
      return 'read-measurement witness in flight';
    case 'agentic-execution:proof-refresh':
      return 'proof witness in flight';
    case 'agentic-execution:upgrade':
      return 'upgrade closure in flight';
    case 'agentic-execution:asset-pack':
    default:
      return 'AssetPack bundle in flight';
  }
}

export function buildAgenticExecutionSummary(input: {
  type?: string | null;
  status?: string | null;
  context?: unknown;
  output?: unknown;
  hints?: AgenticExecutionProofHints | null;
}): AgenticExecutionSummary {
  const canonicalType = normalizeAgenticExecutionType(input.type);
  const hints =
    input.hints || readAgenticExecutionProofHints(input.context, input.output);
  const displayStatus = deriveDisplayExecutionStatus(
    input.status,
    input.context,
    input.output,
    hints,
  );

  return {
    canonicalType,
    family: canonicalType.replace('agentic-execution:', '') as AgenticExecutionSummary['family'],
    label: formatAgenticExecutionLabel(canonicalType),
    lens: deriveAgenticExecutionLens(canonicalType),
    proofStatus: deriveAgenticExecutionProofStatus(canonicalType, displayStatus, hints),
    closureFocus: deriveAgenticExecutionClosureFocus(canonicalType),
  };
}

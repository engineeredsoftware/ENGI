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

export function deriveAgenticExecutionProofStatus(value?: string | null, status?: string | null) {
  const canonicalType = normalizeAgenticExecutionType(value);
  const normalizedStatus = normalizeWhitespace(status).toLowerCase();

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
}): AgenticExecutionSummary {
  const canonicalType = normalizeAgenticExecutionType(input.type);

  return {
    canonicalType,
    family: canonicalType.replace('agentic-execution:', '') as AgenticExecutionSummary['family'],
    label: formatAgenticExecutionLabel(canonicalType),
    lens: deriveAgenticExecutionLens(canonicalType),
    proofStatus: deriveAgenticExecutionProofStatus(canonicalType, input.status),
    closureFocus: deriveAgenticExecutionClosureFocus(canonicalType),
  };
}

import type {
  AssetPackReadRightState,
  AssetPackSourceSafePreview,
} from './read-need';

export type AssetPackSourceVisibility =
  | 'withheld_before_settlement'
  | 'available_after_settlement'
  | 'denied';

export type AssetPackDisclosureReaderAction =
  | 'pay_to_unlock'
  | 'read_as_owner'
  | 'read_as_licensee'
  | 'blocked';

export interface AssetPackProtectedSourceLeakageFinding {
  path: string;
  reason: 'forbidden_source_field' | 'source_patch_marker' | 'source_code_marker';
  excerpt: string;
}

export interface AssetPackProtectedSourceLeakageReview {
  protectedSourceDetected: boolean;
  findingCount: number;
  findings: AssetPackProtectedSourceLeakageFinding[];
}

export interface AssetPackDisclosureReview {
  schema: 'bitcode.asset-pack.disclosure-review';
  assetPackId: string;
  previewId: string;
  access: {
    readRightState: AssetPackReadRightState;
    sourceVisibility: AssetPackSourceVisibility;
    readerAction: AssetPackDisclosureReaderAction;
    sourceAvailable: boolean;
    reason: string;
  };
  policy: {
    accessPolicyId: string;
    accessPolicyHash: string;
    protectedSourceDisclosure: 'forbidden_before_settlement';
    visibleBeforeSettlement: string[];
    withheldBeforeSettlement: string[];
  };
  range: AssetPackSourceSafePreview['rangeProjection'];
  roots: {
    previewRoot: string;
    proofRoot: string;
    sourceManifestRoot: string;
    feeQuoteRoot: string;
    projectionRoot: string;
    reviewRoot: string;
  };
  sourceLeakage: AssetPackProtectedSourceLeakageReview;
  reviewedAt: string;
}

const FORBIDDEN_SOURCE_FIELD_NAMES = new Set([
  'diff',
  'fullassetpackpatch',
  'fullpatch',
  'licensedreadpayload',
  'patch',
  'protectedsource',
  'protectedsourcecontent',
  'sourcebearingmanifestentries',
  'sourcecontent',
  'sourcefiles',
  'sourcepatch',
]);

const SOURCE_PATCH_MARKERS = [
  /diff --git/u,
  /^@@\s+-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?/mu,
  /^---\s+a\//mu,
  /^\+\+\+\s+b\//mu,
];

const SOURCE_CODE_MARKERS = [
  /\bexport\s+(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/u,
  /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/u,
  /\bclass\s+[A-Za-z_$][\w$]*\b/u,
];

export function buildAssetPackDisclosureReview(input: {
  preview: AssetPackSourceSafePreview;
  readRightState?: AssetPackReadRightState | null;
  sourceAvailable?: boolean | null;
  reason?: string | null;
  reviewedAt?: string;
}): AssetPackDisclosureReview {
  const preview = input.preview;
  const readRightState =
    input.readRightState ||
    preview.accessPolicy.readRightState ||
    preview.unlock.state;
  const sourceAvailable = input.sourceAvailable ?? preview.unlock.sourceAvailable === true;
  const sourceVisibility = resolveSourceVisibility(readRightState, sourceAvailable);
  const readerAction = resolveReaderAction(readRightState, sourceAvailable);
  const reviewedAt = input.reviewedAt || preview.createdAt;
  const sourceLeakage = reviewAssetPackProtectedSourceLeakage(preview);
  const reviewRoot = `sha256:${sha256(stableStringify({
    assetPackId: preview.assetPackId,
    previewId: preview.previewId,
    previewRoot: preview.roots.previewRoot,
    accessPolicyHash: preview.accessPolicy.accessPolicyHash,
    readRightState,
    sourceAvailable,
    sourceLeakage,
  }))}`;

  return {
    schema: 'bitcode.asset-pack.disclosure-review',
    assetPackId: preview.assetPackId,
    previewId: preview.previewId,
    access: {
      readRightState,
      sourceVisibility,
      readerAction,
      sourceAvailable,
      reason: input.reason || preview.unlock.reason,
    },
    policy: {
      accessPolicyId: preview.accessPolicy.accessPolicyId,
      accessPolicyHash: preview.accessPolicy.accessPolicyHash,
      protectedSourceDisclosure: preview.disclosurePolicy.protectedSourceDisclosure,
      visibleBeforeSettlement: [...preview.disclosurePolicy.visibleBeforeSettlement],
      withheldBeforeSettlement: [...preview.disclosurePolicy.withheldBeforeSettlement],
    },
    range: { ...preview.rangeProjection },
    roots: {
      previewRoot: preview.roots.previewRoot,
      proofRoot: preview.roots.proofRoot,
      sourceManifestRoot: preview.roots.sourceManifestRoot,
      feeQuoteRoot: preview.feeQuote.quoteRoot,
      projectionRoot: preview.rangeProjection.projectionRoot,
      reviewRoot,
    },
    sourceLeakage,
    reviewedAt,
  };
}

export function assertAssetPackDisclosureSourceSafe(
  review: AssetPackDisclosureReview,
): AssetPackDisclosureReview {
  if (review.sourceLeakage.protectedSourceDetected) {
    const paths = review.sourceLeakage.findings.map((finding) => finding.path).join(', ');
    throw new Error(`AssetPack source-safe preview leaked protected source at ${paths}.`);
  }

  return review;
}

export function reviewAssetPackProtectedSourceLeakage(
  value: unknown,
): AssetPackProtectedSourceLeakageReview {
  const findings: AssetPackProtectedSourceLeakageFinding[] = [];
  visitForProtectedSource(value, [], findings);

  return {
    protectedSourceDetected: findings.length > 0,
    findingCount: findings.length,
    findings,
  };
}

export function summarizeAssetPackDisclosureReview(
  review: AssetPackDisclosureReview,
): string {
  const leakage = review.sourceLeakage.protectedSourceDetected
    ? `${review.sourceLeakage.findingCount} protected-source leakage finding(s)`
    : 'no protected-source leakage';
  return [
    `AssetPack ${review.assetPackId}`,
    `access ${review.access.readRightState}`,
    `source ${review.access.sourceVisibility}`,
    `action ${review.access.readerAction}`,
    leakage,
  ].join('; ');
}

function resolveSourceVisibility(
  readRightState: AssetPackReadRightState,
  sourceAvailable: boolean,
): AssetPackSourceVisibility {
  if (readRightState === 'denied') return 'denied';
  if (sourceAvailable && (readRightState === 'owner_read' || readRightState === 'licensed_read')) {
    return 'available_after_settlement';
  }
  return 'withheld_before_settlement';
}

function resolveReaderAction(
  readRightState: AssetPackReadRightState,
  sourceAvailable: boolean,
): AssetPackDisclosureReaderAction {
  if (readRightState === 'denied') return 'blocked';
  if (sourceAvailable && readRightState === 'owner_read') return 'read_as_owner';
  if (sourceAvailable && readRightState === 'licensed_read') return 'read_as_licensee';
  return 'pay_to_unlock';
}

function visitForProtectedSource(
  value: unknown,
  path: string[],
  findings: AssetPackProtectedSourceLeakageFinding[],
): void {
  if (value === null || value === undefined) return;

  if (typeof value === 'string') {
    collectStringFindings(value, path, findings);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => visitForProtectedSource(entry, [...path, String(index)], findings));
    return;
  }

  if (typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const childPath = [...path, key];
    if (FORBIDDEN_SOURCE_FIELD_NAMES.has(normalizeFieldName(key)) && child !== null && child !== undefined) {
      findings.push({
        path: pathLabel(childPath),
        reason: 'forbidden_source_field',
        excerpt: excerptFor(child),
      });
    }
    visitForProtectedSource(child, childPath, findings);
  }
}

function collectStringFindings(
  value: string,
  path: string[],
  findings: AssetPackProtectedSourceLeakageFinding[],
): void {
  const trimmed = value.trim();
  if (!trimmed) return;

  if (SOURCE_PATCH_MARKERS.some((pattern) => pattern.test(trimmed))) {
    findings.push({
      path: pathLabel(path),
      reason: 'source_patch_marker',
      excerpt: excerptFor(trimmed),
    });
    return;
  }

  if (SOURCE_CODE_MARKERS.some((pattern) => pattern.test(trimmed))) {
    findings.push({
      path: pathLabel(path),
      reason: 'source_code_marker',
      excerpt: excerptFor(trimmed),
    });
  }
}

function normalizeFieldName(value: string): string {
  return value.replace(/[^A-Za-z0-9]/gu, '').toLowerCase();
}

function pathLabel(path: string[]): string {
  return path.length ? path.join('.') : '<root>';
}

function excerptFor(value: unknown): string {
  const text = typeof value === 'string' ? value : stableStringify(value);
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function sha256(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

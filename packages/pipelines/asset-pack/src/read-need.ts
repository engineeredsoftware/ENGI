import { createHash } from 'node:crypto';
import type { DepositorySearchRead } from './depository-search';

export type ReadNeedReviewState =
  | 'needs_acceptance'
  | 'accepted'
  | 'resynthesis_requested';

export interface ReadNeedMeasurementDimension {
  dimension: string;
  weight: number;
  volume: number;
}

export interface ReadNeed {
  schema: 'bitcode.read.need';
  needId: string;
  reviewState: ReadNeedReviewState;
  measurementRoot: string;
  read: {
    id?: string | null;
    prompt: string;
    repositoryFullName?: string | null;
    sourceBranch?: string | null;
    sourceCommit?: string | null;
  };
  requirements: string[];
  closureCriteria: string[];
  failureModes: string[];
  targetArtifactKinds: string[];
  sourceConstraints: {
    repositoryFullName?: string | null;
    sourceBranch?: string | null;
    sourceCommit?: string | null;
    protectedSourceDisclosure: 'forbidden_before_settlement';
  };
  proofExpectations: string[];
  pricingMeasurementInputs: {
    measurementVector: ReadNeedMeasurementDimension[];
    weightedRequestedVolume: number;
    shareToFeeFormula: string;
  };
  feedbackHistory: string[];
  review?: {
    status: 'accepted';
    acceptedAt: string;
    acceptanceRoot: string;
    nextStage: 'need_fit_search';
  };
}

export interface ReadNeedFitAdmission {
  admitted: boolean;
  blockers: string[];
  acceptedNeed: ReadNeed | null;
}

type ReadNeedSourceInput = {
  read?: unknown;
  definitionOfRead?: unknown;
  readRequest?: unknown;
  sourceRevision?: unknown;
  repository?: unknown;
  readMeasurement?: unknown;
  targetArtifactKinds?: unknown;
  targetKinds?: unknown;
  closureCriteria?: unknown;
  failureModes?: unknown;
  feedback?: unknown;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = stringValue(value);
    if (candidate) return candidate;
  }
  return null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => stringValue(entry))
    .filter(Boolean);
}

function getPath(value: unknown, path: string[]): unknown {
  let cursor = value;
  for (const part of path) {
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

function normalizeArtifactKind(value: string): string {
  return value.toLowerCase().replace(/[_\s]+/g, '-');
}

function normalizeSource(input: ReadNeedSourceInput) {
  const readRecord = recordValue(input.read);
  const requestRecord = recordValue(input.readRequest);
  const sourceRevision = recordValue(input.sourceRevision);
  const repository = recordValue(input.repository);
  const readMeasurement = recordValue(input.readMeasurement);
  const prompt = firstString(
    typeof input.read === 'string' ? input.read : undefined,
    readRecord?.prompt,
    readRecord?.read,
    requestRecord?.prompt,
    requestRecord?.read,
    input.definitionOfRead,
    readMeasurement?.prompt,
    readMeasurement?.summary
  ) || '';

  return {
    id: firstString(readRecord?.id, readRecord?.readId, requestRecord?.id, requestRecord?.readId, readMeasurement?.id),
    prompt,
    repositoryFullName: firstString(
      sourceRevision?.repositoryFullName,
      repository?.fullName,
      repository?.repositoryFullName,
      repository?.repo,
      readRecord?.repositoryFullName,
      requestRecord?.repositoryFullName,
      readMeasurement?.repositoryFullName,
      getPath(readMeasurement, ['scenario', 'repo'])
    ),
    sourceBranch: firstString(
      sourceRevision?.branch,
      repository?.branch,
      readRecord?.sourceBranch,
      requestRecord?.sourceBranch,
      readMeasurement?.sourceBranch
    ),
    sourceCommit: firstString(
      sourceRevision?.commit,
      repository?.commit,
      readRecord?.sourceCommit,
      requestRecord?.sourceCommit,
      readMeasurement?.sourceCommit
    ),
  };
}

function normalizeTargetArtifactKinds(input: ReadNeedSourceInput): string[] {
  const readRecord = recordValue(input.read);
  const requestRecord = recordValue(input.readRequest);
  const readMeasurement = recordValue(input.readMeasurement);
  const kinds = [
    ...stringArray(input.targetArtifactKinds),
    ...stringArray(input.targetKinds),
    ...stringArray(readRecord?.targetArtifactKinds),
    ...stringArray(readRecord?.targetKinds),
    ...stringArray(requestRecord?.targetArtifactKinds),
    ...stringArray(requestRecord?.targetKinds),
    ...stringArray(readMeasurement?.targetArtifactKinds),
  ];
  const normalized = [...new Set(kinds.map(normalizeArtifactKind).filter(Boolean))];
  return normalized.length
    ? normalized
    : ['repository-revision', 'asset-pack-evidence', 'proof-root', 'reconciliation-readback'];
}

function defaultRequirements(read: ReturnType<typeof normalizeSource>): string[] {
  return [
    'Understand the reader request as a bounded source-reading need before searching the depository.',
    'Find source-bound deposited evidence that satisfies the accepted Need, not merely related prose.',
    'Preserve proof, measurement, and reconciliation readback requirements through Fit search and AssetPack synthesis.',
    'Prevent protected source disclosure before preview approval and settlement readback.',
    ...(read.repositoryFullName ? [`Bind Fit candidates to repository ${read.repositoryFullName}.`] : []),
    ...(read.sourceCommit ? [`Bind Fit candidates to source commit ${read.sourceCommit}.`] : []),
  ];
}

function defaultClosureCriteria(read: ReturnType<typeof normalizeSource>): string[] {
  return [
    'The Need has requirements, target artifact kinds, proof expectations, and failure modes.',
    'Candidate recall is source-bound to the accepted Need repository, branch, and commit constraints.',
    'The Fit result exposes query root, ranking root, selected candidate ids, score evidence, and proof/readback posture.',
    'The AssetPack preview excludes protected source material before settlement.',
    'BTC fee, ownership, license, journal, and ledger rows must be read back before unlock.',
    ...(read.prompt ? [`The Fit must satisfy: ${read.prompt}`] : []),
  ];
}

function defaultFailureModes(): string[] {
  return [
    'need_not_accepted',
    'repository_mismatch',
    'source_commit_mismatch',
    'proof_or_measurement_missing',
    'source_preview_before_settlement',
    'ledger_database_readback_missing',
  ];
}

function measurementVectorForNeed(
  read: ReturnType<typeof normalizeSource>,
  targetArtifactKinds: string[],
  closureCriteria: string[]
): ReadNeedMeasurementDimension[] {
  const promptVolume = Math.max(1, Math.ceil(read.prompt.length / 160));
  const targetVolume = Math.max(1, targetArtifactKinds.length);
  const closureVolume = Math.max(1, closureCriteria.length);
  return [
    { dimension: 'semantic_relevance', weight: 0.36, volume: promptVolume },
    { dimension: 'source_binding', weight: 0.24, volume: read.repositoryFullName ? 1 : 0 },
    { dimension: 'artifact_kind_fit', weight: 0.20, volume: targetVolume },
    { dimension: 'closure_specificity', weight: 0.20, volume: closureVolume },
  ];
}

function weightedMeasurementVolume(vector: ReadNeedMeasurementDimension[], admittedFitQuality = 1): number {
  return Number(vector
    .reduce((total, entry) => total + (entry.weight * entry.volume * admittedFitQuality), 0)
    .toFixed(6));
}

export function synthesizeReadNeedForPipelineInput(input: ReadNeedSourceInput): ReadNeed {
  const read = normalizeSource(input);
  const targetArtifactKinds = normalizeTargetArtifactKinds(input);
  const explicitClosureCriteria = [
    ...stringArray(input.closureCriteria),
    ...stringArray(recordValue(input.read)?.closureCriteria),
    ...stringArray(recordValue(input.readRequest)?.closureCriteria),
    ...stringArray(recordValue(input.readMeasurement)?.closureCriteria),
  ];
  const closureCriteria = explicitClosureCriteria.length
    ? [...new Set(explicitClosureCriteria)]
    : defaultClosureCriteria(read);
  const failureModes = [
    ...defaultFailureModes(),
    ...stringArray(input.failureModes),
    ...stringArray(recordValue(input.read)?.failureModes),
    ...stringArray(recordValue(input.readRequest)?.failureModes),
  ];
  const feedbackHistory = stringArray(input.feedback);
  const measurementVector = measurementVectorForNeed(read, targetArtifactKinds, closureCriteria);
  const seed = {
    read,
    targetArtifactKinds,
    closureCriteria,
    failureModes,
    feedbackHistory,
    measurementVector,
  };
  const measurementRoot = `sha256:${sha256(stableStringify({
    read,
    targetArtifactKinds,
    closureCriteria,
    measurementVector,
  }))}`;

  return {
    schema: 'bitcode.read.need',
    needId: `need-${sha256(stableStringify(seed)).slice(0, 16)}`,
    reviewState: 'needs_acceptance',
    measurementRoot,
    read,
    requirements: defaultRequirements(read),
    closureCriteria,
    failureModes: [...new Set(failureModes)],
    targetArtifactKinds,
    sourceConstraints: {
      repositoryFullName: read.repositoryFullName,
      sourceBranch: read.sourceBranch,
      sourceCommit: read.sourceCommit,
      protectedSourceDisclosure: 'forbidden_before_settlement',
    },
    proofExpectations: [
      'source-bound candidate ranking root',
      'proof root',
      'measurement evidence',
      'settlement readback before unlock',
    ],
    pricingMeasurementInputs: {
      measurementVector,
      weightedRequestedVolume: weightedMeasurementVolume(measurementVector),
      shareToFeeFormula: 'sum(measurement.weight * measurement.volume * admitted_fit_quality)',
    },
    feedbackHistory,
  };
}

export function acceptReadNeed(
  need: ReadNeed,
  acceptedAt = new Date().toISOString()
): ReadNeed {
  const acceptanceRoot = `sha256:${sha256(stableStringify({
    needId: need.needId,
    measurementRoot: need.measurementRoot,
    acceptedAt,
    nextStage: 'need_fit_search',
  }))}`;
  return {
    ...need,
    reviewState: 'accepted',
    review: {
      status: 'accepted',
      acceptedAt,
      acceptanceRoot,
      nextStage: 'need_fit_search',
    },
  };
}

export function isAcceptedReadNeed(value: unknown): value is ReadNeed {
  const record = recordValue(value);
  return Boolean(
    record?.schema === 'bitcode.read.need' &&
    record.reviewState === 'accepted' &&
    typeof record.needId === 'string' &&
    typeof record.measurementRoot === 'string'
  );
}

export function resolveReadNeedFromPipelineInput(input: unknown): ReadNeed | null {
  const record = recordValue(input);
  const direct = record?.acceptedReadNeed ?? record?.readNeed ?? record?.need;
  return isAcceptedReadNeed(direct) || recordValue(direct)?.schema === 'bitcode.read.need'
    ? direct as ReadNeed
    : null;
}

export function shouldRequireAcceptedReadNeed(input: unknown): boolean {
  const record = recordValue(input);
  return Boolean(
    process.env.BITCODE_PIPELINE_REQUIRE_ACCEPTED_READ_NEED === '1' ||
    record?.requireAcceptedReadNeed === true ||
    recordValue(record?.harness)?.requireAcceptedReadNeed === true
  );
}

export function admitNeedFitSearch(input: unknown): ReadNeedFitAdmission {
  const acceptedNeed = resolveReadNeedFromPipelineInput(input);
  if (isAcceptedReadNeed(acceptedNeed)) {
    return { admitted: true, blockers: [], acceptedNeed };
  }
  if (!shouldRequireAcceptedReadNeed(input)) {
    return { admitted: true, blockers: [], acceptedNeed: null };
  }
  return {
    admitted: false,
    blockers: ['accepted_read_need_missing'],
    acceptedNeed: null,
  };
}

export function readNeedToDepositorySearchRead(need: ReadNeed): DepositorySearchRead {
  return {
    id: need.needId,
    prompt: need.read.prompt,
    repositoryFullName: need.sourceConstraints.repositoryFullName,
    sourceBranch: need.sourceConstraints.sourceBranch,
    sourceCommit: need.sourceConstraints.sourceCommit,
    targetArtifactKinds: need.targetArtifactKinds,
    closureCriteria: need.closureCriteria,
    failureModes: need.failureModes,
  };
}

export function buildShareToFeePreview(input: {
  need: ReadNeed;
  admittedFitQuality: number;
  satsPerWeightedVolume?: number;
  minimumSats?: number;
}) {
  const weightedAdmittedVolume = weightedMeasurementVolume(
    input.need.pricingMeasurementInputs.measurementVector,
    Math.max(0, Math.min(1, input.admittedFitQuality))
  );
  const satsPerWeightedVolume = input.satsPerWeightedVolume ?? 1000;
  const minimumSats = input.minimumSats ?? 546;
  return {
    formula: input.need.pricingMeasurementInputs.shareToFeeFormula,
    needId: input.need.needId,
    needMeasurementRoot: input.need.measurementRoot,
    weightedAdmittedVolume,
    sats: Math.max(minimumSats, Math.round(weightedAdmittedVolume * satsPerWeightedVolume)),
    finalityState: 'preview_not_paid' as const,
    payer: 'reader' as const,
  };
}

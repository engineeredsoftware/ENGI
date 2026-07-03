import { createHash } from 'node:crypto';
import type { Execution } from '@bitcode/execution-generics';
import type { AssetPackPreviewBoundary } from './asset-pack-preview-boundary';
import type { AssetPackSettlementRightsDeliveryBoundary } from './asset-pack-settlement-rights-delivery';
import type { ReadingInterfaceProductParity } from './reading-interface-product-parity';
import type { ReadingOperationalTelemetryRepairReadback } from './reading-operational-telemetry-repair-readback';
import type { ReadFitsFindingRuntime } from './read-fits-finding-runtime';
import type { ReadNeedReviewResynthesisRuntime } from './read-need-review-resynthesis';

export const READING_LOCAL_STAGING_REHEARSAL_LANES = ['local', 'staging-testnet'] as const;

export type ReadingLocalStagingRehearsalLane =
  (typeof READING_LOCAL_STAGING_REHEARSAL_LANES)[number];

export const READING_LOCAL_STAGING_REHEARSAL_STAGE_IDS = [
  'request-read',
  'review-synthesized-need',
  'request-finding-fits',
  'review-assetpack-preview',
  'buy-assetpack-settle',
] as const;

export type ReadingLocalStagingRehearsalStageId =
  (typeof READING_LOCAL_STAGING_REHEARSAL_STAGE_IDS)[number];

export const READING_LOCAL_STAGING_REHEARSAL_ROW_IDS = [
  'lane:local-reading-rehearsal',
  'lane:staging-testnet-reading-rehearsal',
  'stage:request-read',
  'stage:review-synthesized-need',
  'stage:request-finding-fits',
  'stage:review-assetpack-preview',
  'stage:buy-assetpack-settle',
  'search:depository-many-fits',
  'telemetry:rich-stream-readback',
  'sync:ledger-database-storage-reconciliation',
  'delivery:post-settlement-pull-request',
  'boundary:value-bearing-mainnet-blocked',
] as const;

export type ReadingLocalStagingRehearsalRowId =
  (typeof READING_LOCAL_STAGING_REHEARSAL_ROW_IDS)[number];

export type ReadingLocalStagingRehearsalRowStatus =
  | 'completed'
  | 'blocked'
  | 'repair-required';

export interface ReadingLocalStagingRehearsalSourceSafety {
  sourceSafetyClass: 'source_safe_reading_local_staging_rehearsal_metadata';
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  protectedSourcePayloadSerialized: false;
  rawProtectedPromptVisible: false;
  rawInterpolatedPromptVisible: false;
  rawProviderResponseVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
  liveLogPayloadSerialized: false;
  sourceBearingDeliveryUnlockedAfterSettlementOnly: true;
  valueBearingMainnetAdmitted: false;
}

export interface ReadingLocalStagingLaneReadback {
  schema: 'bitcode.reading.local-staging-rehearsal.lane-readback';
  laneId: ReadingLocalStagingRehearsalLane;
  admittedForRehearsal: true;
  realInferenceRequired: boolean;
  sandboxExecutionRequired: boolean;
  databaseReadbackRequired: boolean;
  stagingProjectRef: string | null;
  stagingRestHost: string | null;
  envSource: 'untracked-env-files-or-host-runtime';
  trackedSecretsAllowed: false;
  valueBearingMainnetAdmitted: false;
  validationCommand: string;
  proofRoot: string;
}

export interface ReadingLocalStagingRehearsalRow {
  schema: 'bitcode.reading.local-staging-rehearsal.row';
  rowId: ReadingLocalStagingRehearsalRowId;
  rowKind: 'lane' | 'stage' | 'search' | 'telemetry' | 'sync' | 'delivery' | 'boundary';
  laneId: ReadingLocalStagingRehearsalLane | 'local-and-staging-testnet' | null;
  stageId: ReadingLocalStagingRehearsalStageId | null;
  status: ReadingLocalStagingRehearsalRowStatus;
  purpose: string;
  evidence: string[];
  requiredRoots: string[];
  blockers: string[];
  warnings: string[];
  sourceSafety: ReadingLocalStagingRehearsalSourceSafety;
  rowRoot: string;
}

export interface ReadingLocalStagingRehearsalStorageRecord {
  schema: 'bitcode.reading.local-staging-rehearsal.storage-record';
  recordId: string;
  namespace: 'reading/rehearsal';
  key:
    | 'localStagingRehearsal'
    | 'rehearsalRows'
    | 'laneReadback'
    | 'stageReadback'
    | 'sourceSafety'
    | 'proofRoots';
  recordKind:
    | 'rehearsal'
    | 'row_set'
    | 'lane_readback'
    | 'stage_readback'
    | 'source_safety'
    | 'proof_roots';
  root: string;
  sourceSafety: ReadingLocalStagingRehearsalSourceSafety;
  payload: Record<string, unknown>;
}

export interface ReadingLocalStagingRehearsal {
  schema: 'bitcode.reading.local-staging-rehearsal';
  rehearsalId: string;
  runId: string;
  lanes: ReadingLocalStagingRehearsalLane[];
  stageIds: ReadingLocalStagingRehearsalStageId[];
  rowCount: number;
  rows: ReadingLocalStagingRehearsalRow[];
  laneReadbacks: ReadingLocalStagingLaneReadback[];
  stageReadback: Record<ReadingLocalStagingRehearsalStageId, ReadingLocalStagingRehearsalRowStatus>;
  coverage: {
    localLaneCovered: true;
    stagingTestnetLaneCovered: true;
    stagingProjectRef: 'tkpyosihuouusyaxtbau';
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/';
    readNeedComprehensionCovered: boolean;
    acceptedNeedCovered: boolean;
    readFitsFindingCovered: boolean;
    depositoryManyFitsCovered: boolean;
    sourceSafePreviewCovered: boolean;
    deterministicQuoteCovered: boolean;
    telemetryStreamingReadbackCovered: boolean;
    ledgerDatabaseStorageSynchronized: boolean;
    postSettlementPullRequestDeliveryCovered: boolean;
    valueBearingMainnetAdmitted: false;
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawPromptTextSerialized: false;
    rawProviderResponseVisible: false;
    unpaidAssetPackSourceVisible: false;
    credentialsSerialized: false;
    walletPrivateMaterialVisible: false;
    privateSettlementPayloadVisible: false;
  };
  storageProjection: ReadingLocalStagingRehearsalStorageRecord[];
  sourceSafety: ReadingLocalStagingRehearsalSourceSafety;
  proofRoots: {
    readNeedRuntimeRoot: string | null;
    readFitsRuntimeRoot: string | null;
    previewBoundaryRoot: string | null;
    settlementBoundaryRoot: string | null;
    operationalReadbackRoot: string | null;
    interfaceParityRoot: string | null;
    laneReadbackRoot: string;
    rowSetRoot: string;
    stageReadbackRoot: string;
    storageRoot: string;
    rehearsalRoot: string;
  };
}

export interface ReadingLocalStagingRehearsalInput {
  runId?: string | null;
  readNeedRuntime?: ReadNeedReviewResynthesisRuntime | null;
  readFitsRuntime?: ReadFitsFindingRuntime | null;
  previewBoundary?: AssetPackPreviewBoundary | null;
  settlementBoundary?: AssetPackSettlementRightsDeliveryBoundary | null;
  operationalReadback?: ReadingOperationalTelemetryRepairReadback | null;
  interfaceParity?: ReadingInterfaceProductParity | null;
  laneReadbacks?: ReadingLocalStagingLaneReadback[];
}

const STAGING_PROJECT_REF = 'tkpyosihuouusyaxtbau';
const STAGING_REST_HOST = 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/';

const SOURCE_SAFETY: ReadingLocalStagingRehearsalSourceSafety = {
  sourceSafetyClass: 'source_safe_reading_local_staging_rehearsal_metadata',
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  protectedSourcePayloadSerialized: false,
  rawProtectedPromptVisible: false,
  rawInterpolatedPromptVisible: false,
  rawProviderResponseVisible: false,
  unpaidAssetPackSourceVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
  liveLogPayloadSerialized: false,
  sourceBearingDeliveryUnlockedAfterSettlementOnly: true,
  valueBearingMainnetAdmitted: false,
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (typeof value === 'undefined') return 'null';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function rootOf(value: unknown): string {
  return `sha256:${sha256(stableStringify(value))}`;
}

function jsonSafe<T>(value: T): Record<string, unknown> {
  return JSON.parse(stableStringify(value)) as Record<string, unknown>;
}

function shortRoot(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.length > 36 ? `${value.slice(0, 24)}...${value.slice(-8)}` : value;
}

function rowStatus(ok: boolean, repair = false): ReadingLocalStagingRehearsalRowStatus {
  if (ok) return 'completed';
  return repair ? 'repair-required' : 'blocked';
}

function laneReadbackFor(laneId: ReadingLocalStagingRehearsalLane): ReadingLocalStagingLaneReadback {
  const staging = laneId === 'staging-testnet';
  const validationCommand = staging
    ? 'pnpm run check:v39-gate10 -- --skip-branch-check'
    : 'pnpm --filter @bitcode/pipeline-asset-pack exec jest --config jest.config.cjs --runTestsByPath src/__tests__/reading-local-staging-rehearsal.test.ts --runInBand --forceExit';
  const withoutRoot = {
    schema: 'bitcode.reading.local-staging-rehearsal.lane-readback' as const,
    laneId,
    admittedForRehearsal: true as const,
    realInferenceRequired: staging,
    sandboxExecutionRequired: true,
    databaseReadbackRequired: true,
    stagingProjectRef: staging ? STAGING_PROJECT_REF : null,
    stagingRestHost: staging ? STAGING_REST_HOST : null,
    envSource: 'untracked-env-files-or-host-runtime' as const,
    trackedSecretsAllowed: false as const,
    valueBearingMainnetAdmitted: false as const,
    validationCommand,
  };
  return {
    ...withoutRoot,
    proofRoot: rootOf(withoutRoot),
  };
}

function defaultLaneReadbacks(): ReadingLocalStagingLaneReadback[] {
  return READING_LOCAL_STAGING_REHEARSAL_LANES.map(laneReadbackFor);
}

function row(input: {
  rowId: ReadingLocalStagingRehearsalRowId;
  rowKind: ReadingLocalStagingRehearsalRow['rowKind'];
  laneId?: ReadingLocalStagingRehearsalRow['laneId'];
  stageId?: ReadingLocalStagingRehearsalStageId | null;
  status: ReadingLocalStagingRehearsalRowStatus;
  purpose: string;
  evidence: string[];
  requiredRoots: Array<string | null | undefined>;
  blockers?: string[];
  warnings?: string[];
}): ReadingLocalStagingRehearsalRow {
  const requiredRoots = input.requiredRoots.filter((entry): entry is string => Boolean(entry));
  const withoutRoot = {
    schema: 'bitcode.reading.local-staging-rehearsal.row' as const,
    rowId: input.rowId,
    rowKind: input.rowKind,
    laneId: input.laneId ?? null,
    stageId: input.stageId ?? null,
    status: input.status,
    purpose: input.purpose,
    evidence: input.evidence,
    requiredRoots,
    blockers: input.blockers || [],
    warnings: input.warnings || [],
    sourceSafety: SOURCE_SAFETY,
  };

  return {
    ...withoutRoot,
    rowRoot: rootOf(withoutRoot),
  };
}

function storageRecord(
  key: ReadingLocalStagingRehearsalStorageRecord['key'],
  recordKind: ReadingLocalStagingRehearsalStorageRecord['recordKind'],
  payload: Record<string, unknown>,
): ReadingLocalStagingRehearsalStorageRecord {
  const root = rootOf({ namespace: 'reading/rehearsal', key, recordKind, payload });
  return {
    schema: 'bitcode.reading.local-staging-rehearsal.storage-record',
    recordId: `reading-rehearsal-${recordKind}-${sha256(`${key}:${root}`).slice(0, 16)}`,
    namespace: 'reading/rehearsal',
    key,
    recordKind,
    root,
    sourceSafety: SOURCE_SAFETY,
    payload,
  };
}

function eventKinds(readback: ReadingOperationalTelemetryRepairReadback | null | undefined): string[] {
  return Object.keys(readback?.operatorReadback?.eventCounts || {}).sort();
}

function hasAllOperationalEvents(readback: ReadingOperationalTelemetryRepairReadback | null | undefined): boolean {
  const observed = eventKinds(readback);
  return [
    'phase',
    'ptrr-agent',
    'ptrr-step',
    'failsafe',
    'thinkings-generation',
    'tool',
    'storage',
    'ledger',
    'wallet',
    'delivery',
    'ui',
    'repair',
  ].every((kind) => observed.includes(kind));
}

function stageReadback(input: ReadingLocalStagingRehearsalInput): Record<ReadingLocalStagingRehearsalStageId, ReadingLocalStagingRehearsalRowStatus> {
  return {
    'request-read': rowStatus(Boolean(input.readNeedRuntime?.proofRoots.readRequestRoot)),
    'review-synthesized-need': rowStatus(input.readNeedRuntime?.reviewState === 'accepted'),
    'request-finding-fits': rowStatus(Boolean(input.readFitsRuntime?.findingFitsAdmission.admitted)),
    'review-assetpack-preview': rowStatus(Boolean(input.previewBoundary?.proofRoots.previewRoot)),
    'buy-assetpack-settle': rowStatus(input.settlementBoundary?.state === 'settlement_delivered', Boolean(input.previewBoundary)),
  };
}

export function buildReadingLocalStagingRehearsal(
  input: ReadingLocalStagingRehearsalInput = {},
): ReadingLocalStagingRehearsal {
  const laneReadbacks = input.laneReadbacks?.length ? input.laneReadbacks : defaultLaneReadbacks();
  const stages = stageReadback(input);
  const readFitsRuntime = input.readFitsRuntime || null;
  const previewBoundary = input.previewBoundary || null;
  const settlementBoundary = input.settlementBoundary || null;
  const operationalReadback = input.operationalReadback || null;
  const interfaceParity = input.interfaceParity || null;
  const readNeedRuntimeRoot = input.readNeedRuntime?.proofRoots.runtimeRoot || null;
  const readFitsRuntimeRoot = readFitsRuntime?.proofRoots.runtimeRoot || null;
  const previewBoundaryRoot = previewBoundary?.proofRoots.boundaryRoot || null;
  const settlementBoundaryRoot = settlementBoundary?.proofRoots.boundaryRoot || null;
  const operationalReadbackRoot = operationalReadback?.proofRoots.readbackRoot || null;
  const interfaceParityRoot = interfaceParity?.proofRoots.parityRoot || null;
  const selectedCandidateCount = readFitsRuntime?.searchSummary.selectedCandidateCount || 0;
  const fitDepositCount = readFitsRuntime?.searchSummary.fitDepositCount || 0;
  const syncAligned = settlementBoundary?.reconciliationReport.state === 'aligned';
  const postSettlementPrReady =
    settlementBoundary?.deliveryUnlock.state === 'source_bearing_pull_request_ready' &&
    settlementBoundary.deliveryUnlock.deliveryMechanism === 'pull_request_after_settlement' &&
    settlementBoundary.deliveryUnlock.sourceBearingDeliveryVisibleToReader === true;

  const rows: ReadingLocalStagingRehearsalRow[] = [
    row({
      rowId: 'lane:local-reading-rehearsal',
      rowKind: 'lane',
      laneId: 'local',
      status: rowStatus(laneReadbacks.some((entry) => entry.laneId === 'local')),
      purpose: 'Bind local Reading rehearsal to untracked local env files, Vercel Sandbox execution posture, local artifacts, and source-safe readback.',
      evidence: ['untracked local env only', 'sandbox harness allowed by explicit opt-in', 'local artifact root', 'source-safe redaction'],
      requiredRoots: laneReadbacks.filter((entry) => entry.laneId === 'local').map((entry) => entry.proofRoot),
    }),
    row({
      rowId: 'lane:staging-testnet-reading-rehearsal',
      rowKind: 'lane',
      laneId: 'staging-testnet',
      status: rowStatus(laneReadbacks.some((entry) => entry.laneId === 'staging-testnet' && entry.stagingProjectRef === STAGING_PROJECT_REF)),
      purpose: 'Bind staging-testnet Reading rehearsal to real bounded inference, Supabase readback, streaming persistence, and source-safe summaries.',
      evidence: ['real inference required', `staging project ${STAGING_PROJECT_REF}`, STAGING_REST_HOST, 'database stream/readback'],
      requiredRoots: laneReadbacks.filter((entry) => entry.laneId === 'staging-testnet').map((entry) => entry.proofRoot),
    }),
    row({
      rowId: 'stage:request-read',
      rowKind: 'stage',
      laneId: 'local-and-staging-testnet',
      stageId: 'request-read',
      status: stages['request-read'],
      purpose: 'Persist the source-safe Read request and route it into ReadNeedComprehensionSynthesis.',
      evidence: ['read request persisted', 'read request root available', 'Need synthesis admitted'],
      requiredRoots: [input.readNeedRuntime?.proofRoots.readRequestRoot, readNeedRuntimeRoot],
    }),
    row({
      rowId: 'stage:review-synthesized-need',
      rowKind: 'stage',
      laneId: 'local-and-staging-testnet',
      stageId: 'review-synthesized-need',
      status: stages['review-synthesized-need'],
      purpose: 'Persist and review the synthesized Need before Finding Fits can run.',
      evidence: ['synthesized Need persisted', 'Need measurement persisted', 'accepted Need admission recorded'],
      requiredRoots: [
        input.readNeedRuntime?.proofRoots.measurementRoot,
        input.readNeedRuntime?.findingFitsAdmission.acceptedNeed?.review?.acceptanceRoot,
        readNeedRuntimeRoot,
      ],
      blockers:
        input.readNeedRuntime?.reviewState === 'accepted'
          ? []
          : ['accepted_read_need_required_before_finding_fits'],
    }),
    row({
      rowId: 'stage:request-finding-fits',
      rowKind: 'stage',
      laneId: 'local-and-staging-testnet',
      stageId: 'request-finding-fits',
      status: stages['request-finding-fits'],
      purpose: 'Run ReadFitsFindingSynthesis from an accepted Need and preserve selected fit provenance.',
      evidence: ['Finding Fits admission', 'query plan root', 'ranking root', 'selected fit provenance root'],
      requiredRoots: [
        readFitsRuntime?.proofRoots.queryPlanRoot,
        readFitsRuntime?.proofRoots.rankingRoot,
        readFitsRuntime?.proofRoots.selectedFitProvenanceRoot,
        readFitsRuntimeRoot,
      ],
      blockers: readFitsRuntime?.findingFitsAdmission.admitted ? [] : ['read_fits_finding_not_admitted'],
    }),
    row({
      rowId: 'stage:review-assetpack-preview',
      rowKind: 'stage',
      laneId: 'local-and-staging-testnet',
      stageId: 'review-assetpack-preview',
      status: stages['review-assetpack-preview'],
      purpose: 'Present only source-safe AssetPack measurements, fit reasons, deterministic BTC quote, and delivery posture before settlement.',
      evidence: ['source-safe preview', 'deterministic quote', 'disclosure review', 'settlement instructions'],
      requiredRoots: [
        previewBoundary?.proofRoots.previewRoot,
        previewBoundary?.proofRoots.quoteRoot,
        previewBoundary?.proofRoots.disclosureReviewRoot,
        previewBoundaryRoot,
      ],
    }),
    row({
      rowId: 'stage:buy-assetpack-settle',
      rowKind: 'stage',
      laneId: 'local-and-staging-testnet',
      stageId: 'buy-assetpack-settle',
      status: stages['buy-assetpack-settle'],
      purpose: 'Observe BTC payment, confirm finality, transfer BTD rights, synchronize projections, and unlock pull-request delivery.',
      evidence: ['BTC payment observation', 'finality receipt', 'BTD rights transfer', 'ledger/database/storage reconciliation'],
      requiredRoots: [
        settlementBoundary?.proofRoots.paymentReceiptRoot,
        settlementBoundary?.proofRoots.finalityRoot,
        settlementBoundary?.proofRoots.rightsTransferRoot,
        settlementBoundary?.proofRoots.reconciliationRoot,
        settlementBoundaryRoot,
      ],
      blockers: settlementBoundary?.state === 'settlement_delivered' ? [] : ['settlement_delivery_not_confirmed'],
    }),
    row({
      rowId: 'search:depository-many-fits',
      rowKind: 'search',
      laneId: 'local-and-staging-testnet',
      status: rowStatus(selectedCandidateCount > 0 && fitDepositCount > 0),
      purpose: 'Prove Depository search finds many candidate deposits above threshold and carries selected fits into AssetPack synthesis.',
      evidence: [
        `selected candidates: ${selectedCandidateCount}`,
        `fit deposits: ${fitDepositCount}`,
        `result state: ${readFitsRuntime?.resultState || 'missing'}`,
      ],
      requiredRoots: [
        readFitsRuntime?.proofRoots.queryRoot,
        readFitsRuntime?.proofRoots.rankingRoot,
        readFitsRuntime?.proofRoots.selectedFitProvenanceRoot,
        readFitsRuntime?.proofRoots.replayRoot,
      ],
      blockers: selectedCandidateCount > 0 && fitDepositCount > 0 ? [] : ['depository_fit_candidates_required'],
    }),
    row({
      rowId: 'telemetry:rich-stream-readback',
      rowKind: 'telemetry',
      laneId: 'local-and-staging-testnet',
      status: rowStatus(hasAllOperationalEvents(operationalReadback), Boolean(operationalReadback)),
      purpose: 'Prove rich log streaming/readback covers phases, PTRR agents, PTRR steps, Failsafes, ThinkingsGenerations, tools, storage, ledger, wallet, delivery, UI, and repairs.',
      evidence: eventKinds(operationalReadback).map((kind) => `event:${kind}`),
      requiredRoots: [
        operationalReadback?.proofRoots.eventStreamRoot,
        operationalReadback?.proofRoots.telemetryRoot,
        operationalReadbackRoot,
      ],
      blockers: hasAllOperationalEvents(operationalReadback) ? [] : ['complete_operational_event_taxonomy_required'],
    }),
    row({
      rowId: 'sync:ledger-database-storage-reconciliation',
      rowKind: 'sync',
      laneId: 'local-and-staging-testnet',
      status: rowStatus(syncAligned, Boolean(settlementBoundary)),
      purpose: 'Prove settlement facts, database projections, and object-storage projections synchronize before source-bearing delivery.',
      evidence: [
        `reconciliation: ${settlementBoundary?.reconciliationReport.state || 'missing'}`,
        `staging project: ${settlementBoundary?.reconciliationReport.stagingTestnetReadback?.supabaseProjectRef || STAGING_PROJECT_REF}`,
      ],
      requiredRoots: [
        settlementBoundary?.proofRoots.reconciliationRoot,
        settlementBoundary?.reconciliationReport.proofRoots.repairPlanRoot,
        settlementBoundaryRoot,
      ],
      blockers: syncAligned ? [] : ['ledger_database_storage_reconciliation_required'],
    }),
    row({
      rowId: 'delivery:post-settlement-pull-request',
      rowKind: 'delivery',
      laneId: 'local-and-staging-testnet',
      status: rowStatus(postSettlementPrReady, Boolean(settlementBoundary)),
      purpose: 'Prove source-bearing pull-request delivery is withheld before settlement and only becomes ready after settlement and BTD rights transfer.',
      evidence: [
        `delivery state: ${settlementBoundary?.deliveryUnlock.state || 'missing'}`,
        `delivery mechanism: ${settlementBoundary?.deliveryUnlock.deliveryMechanism || 'missing'}`,
      ],
      requiredRoots: [
        settlementBoundary?.proofRoots.deliveryRoot,
        settlementBoundary?.proofRoots.rightsTransferRoot,
        settlementBoundaryRoot,
      ],
      blockers: postSettlementPrReady ? [] : ['post_settlement_pull_request_delivery_required'],
    }),
    row({
      rowId: 'boundary:value-bearing-mainnet-blocked',
      rowKind: 'boundary',
      laneId: 'local-and-staging-testnet',
      status: 'completed',
      purpose: 'Keep local and staging-testnet rehearsals non-value-bearing while preserving mainnet admission as blocked until a future canon admits it.',
      evidence: ['value-bearing mainnet admitted: false', 'server custody: false', 'tracked secrets allowed: false'],
      requiredRoots: [
        previewBoundary?.proofRoots.settlementInstructionsRoot,
        settlementBoundary?.proofRoots.paymentReceiptRoot,
        interfaceParityRoot,
      ],
    }),
  ];

  const rowSetRoot = rootOf(rows.map((entry) => entry.rowRoot));
  const laneReadbackRoot = rootOf(laneReadbacks.map((entry) => entry.proofRoot));
  const stageReadbackRoot = rootOf(stages);
  const coverage: ReadingLocalStagingRehearsal['coverage'] = {
    localLaneCovered: true as const,
    stagingTestnetLaneCovered: true as const,
    stagingProjectRef: STAGING_PROJECT_REF,
    stagingRestHost: STAGING_REST_HOST,
    readNeedComprehensionCovered: Boolean(readNeedRuntimeRoot),
    acceptedNeedCovered: input.readNeedRuntime?.reviewState === 'accepted',
    readFitsFindingCovered: Boolean(readFitsRuntimeRoot),
    depositoryManyFitsCovered: selectedCandidateCount > 0 && fitDepositCount > 0,
    sourceSafePreviewCovered: Boolean(previewBoundaryRoot && previewBoundary?.sourceSafety.sourceSafeMetadataOnly),
    deterministicQuoteCovered: Boolean(previewBoundary?.quoteReceipt.deterministic),
    telemetryStreamingReadbackCovered: hasAllOperationalEvents(operationalReadback),
    ledgerDatabaseStorageSynchronized: syncAligned,
    postSettlementPullRequestDeliveryCovered: postSettlementPrReady,
    valueBearingMainnetAdmitted: false as const,
    sourceSafeMetadataOnly: true as const,
    protectedSourceVisible: false as const,
    rawPromptTextSerialized: false as const,
    rawProviderResponseVisible: false as const,
    unpaidAssetPackSourceVisible: false as const,
    credentialsSerialized: false as const,
    walletPrivateMaterialVisible: false as const,
    privateSettlementPayloadVisible: false as const,
  };
  const storageProjection = [
    storageRecord('laneReadback', 'lane_readback', {
      laneIds: laneReadbacks.map((entry) => entry.laneId),
      laneReadbackRoot,
      stagingProjectRef: STAGING_PROJECT_REF,
    }),
    storageRecord('stageReadback', 'stage_readback', {
      stageReadback: stages,
      stageReadbackRoot,
    }),
    storageRecord('rehearsalRows', 'row_set', {
      rowIds: rows.map((entry) => entry.rowId),
      rowSetRoot,
    }),
    storageRecord('sourceSafety', 'source_safety', jsonSafe(SOURCE_SAFETY)),
    storageRecord('proofRoots', 'proof_roots', {
      readNeedRuntimeRoot: shortRoot(readNeedRuntimeRoot),
      readFitsRuntimeRoot: shortRoot(readFitsRuntimeRoot),
      previewBoundaryRoot: shortRoot(previewBoundaryRoot),
      settlementBoundaryRoot: shortRoot(settlementBoundaryRoot),
      operationalReadbackRoot: shortRoot(operationalReadbackRoot),
      interfaceParityRoot: shortRoot(interfaceParityRoot),
    }),
  ];
  const storageRoot = rootOf(storageProjection.map((entry) => entry.root));
  const rehearsalRoot = rootOf({
    rows: rows.map((entry) => entry.rowRoot),
    laneReadbackRoot,
    stageReadbackRoot,
    storageRoot,
    coverage,
  });
  const rehearsalId = `reading-local-staging-rehearsal-${sha256(rehearsalRoot).slice(0, 16)}`;
  const rehearsal = {
    schema: 'bitcode.reading.local-staging-rehearsal' as const,
    rehearsalId,
    runId: input.runId || 'reading-local-staging-rehearsal',
    lanes: [...READING_LOCAL_STAGING_REHEARSAL_LANES],
    stageIds: [...READING_LOCAL_STAGING_REHEARSAL_STAGE_IDS],
    rowCount: rows.length,
    rows,
    laneReadbacks,
    stageReadback: stages,
    coverage,
    storageProjection: [
      ...storageProjection,
      storageRecord('localStagingRehearsal', 'rehearsal', {
        rehearsalId,
        rowCount: rows.length,
        laneReadbackRoot,
        stageReadbackRoot,
        rowSetRoot,
        storageRoot,
        coverage,
      }),
    ],
    sourceSafety: SOURCE_SAFETY,
    proofRoots: {
      readNeedRuntimeRoot,
      readFitsRuntimeRoot,
      previewBoundaryRoot,
      settlementBoundaryRoot,
      operationalReadbackRoot,
      interfaceParityRoot,
      laneReadbackRoot,
      rowSetRoot,
      stageReadbackRoot,
      storageRoot,
      rehearsalRoot,
    },
  };

  assertReadingLocalStagingRehearsalSourceSafe(rehearsal);
  return rehearsal;
}

export function persistReadingLocalStagingRehearsal(
  execution: Execution | null | undefined,
  rehearsal: ReadingLocalStagingRehearsal,
): void {
  if (!execution) return;
  try {
    execution.store('reading/rehearsal', 'localStagingRehearsal', rehearsal as any);
    execution.store('reading/rehearsal', 'rehearsalRows', rehearsal.rows as any);
    execution.store('reading/rehearsal', 'laneReadback', rehearsal.laneReadbacks as any);
    execution.store('reading/rehearsal', 'stageReadback', rehearsal.stageReadback as any);
    execution.store('reading/rehearsal', 'sourceSafety', rehearsal.sourceSafety as any);
    execution.store('reading/rehearsal', 'proofRoots', rehearsal.proofRoots as any);
    execution.store('reading/rehearsal', 'rehearsalRoot', rehearsal.proofRoots.rehearsalRoot);
  } catch {}
}

export function assertReadingLocalStagingRehearsalSourceSafe(
  rehearsal: ReadingLocalStagingRehearsal,
): void {
  const serialized = stableStringify(rehearsal);
  const forbidden = [
    `${['sk', 'proj'].join('-')}-`,
    `${['sb', 'secret'].join('_')}__`,
    ['service', 'role'].join('_'),
    ['OPENAI', 'API', 'KEY'].join('_'),
    ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
    ['VERCEL', 'TOKEN'].join('_'),
    ['PRIVATE', 'KEY'].join('_'),
    'diff --git',
    'raw source',
    'source contents',
  ];

  for (const marker of forbidden) {
    if (serialized.includes(marker)) {
      throw new Error(`Reading local/staging rehearsal leaked forbidden marker: ${marker}`);
    }
  }
  if (!rehearsal.sourceSafety.sourceSafeMetadataOnly) {
    throw new Error('Reading local/staging rehearsal must remain source-safe metadata only.');
  }
  if (rehearsal.coverage.valueBearingMainnetAdmitted !== false) {
    throw new Error('Reading local/staging rehearsal must not admit value-bearing mainnet.');
  }
}

export function summarizeReadingLocalStagingRehearsal(
  rehearsal: ReadingLocalStagingRehearsal,
): Record<string, unknown> {
  return {
    schema: rehearsal.schema,
    rehearsalId: rehearsal.rehearsalId,
    rowCount: rehearsal.rowCount,
    lanes: rehearsal.lanes,
    stages: rehearsal.stageReadback,
    stagingProjectRef: rehearsal.coverage.stagingProjectRef,
    depositoryManyFitsCovered: rehearsal.coverage.depositoryManyFitsCovered,
    telemetryStreamingReadbackCovered: rehearsal.coverage.telemetryStreamingReadbackCovered,
    ledgerDatabaseStorageSynchronized: rehearsal.coverage.ledgerDatabaseStorageSynchronized,
    postSettlementPullRequestDeliveryCovered: rehearsal.coverage.postSettlementPullRequestDeliveryCovered,
    valueBearingMainnetAdmitted: rehearsal.coverage.valueBearingMainnetAdmitted,
    sourceSafeMetadataOnly: rehearsal.coverage.sourceSafeMetadataOnly,
    rehearsalRoot: rehearsal.proofRoots.rehearsalRoot,
  };
}

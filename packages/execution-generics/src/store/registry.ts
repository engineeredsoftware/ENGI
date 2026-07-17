/**
 * Execution Store Registry — Canonical Namespaces and Typed Shapes
 *
 * Centralized constants and helper types for Execution.store/get keys.
 * Keep all namespaces stable and discoverable to prevent drift.
 *
 * Usage:
 *  - Import a namespace constant (e.g., NS_VALIDATION_READY_TO_FINISH)
 *  - Prefer helper setters/getters where available for typed access
 *  - When storing complex agent outputs, reference the agent's Output type
 */

import type { Execution } from '../Execution';
import type { StorableValue } from '../types';

// ==================== VALIDATION PHASE ====================

/**
 * Namespace for the ReadyToFinish agent in the Validation phase
 * Stores the final readiness decision for header rendering and routing
 */
/**
 * Pipeline-specific ReadyToFinish namespaces for maximal clarity.
 * Prefer these over any generic alias.
 */
export const NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH =
  'execution-asset-pack-pipeline-phase-validation-ready-to-finish-agent' as const;
export const NS_EXEC_MEASURE_VALIDATION_READY_TO_FINISH =
  'execution-measure-pipeline-phase-validation-ready-to-finish-agent' as const;

/**
 * Generic ReadyToFinish namespace. Use pipeline-specific constants instead.
 */
export const NS_VALIDATION_READY_TO_FINISH = NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH;

/**
 * Generic shape for ReadyToFinish decision. Prefer specializing via generics with
 * the agent's structured Output type where available.
 */
export type ValidationReadyToFinish<TAssessment = unknown, TResult = unknown> = {
  approved: boolean;
  assessment?: TAssessment | null;
  confidence?: number | null;
  result?: TResult | null;
  timestamp?: string;
};

/**
 * Store the ReadyToFinish decision (typed wrapper). Callers should pass the agent
 * Output-derived assessment/result types when possible.
 */
export function setValidationReadyToFinish<TA extends StorableValue = StorableValue, TR extends StorableValue = StorableValue>(
  exec: Execution,
  value: ValidationReadyToFinish<TA, TR>,
  pipeline: 'asset-pack' | 'measure' = 'asset-pack'
): void {
  const NS = pipeline === 'measure'
    ? NS_EXEC_MEASURE_VALIDATION_READY_TO_FINISH
    : NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH;
  exec.store(NS, 'approved', !!value.approved);
  if (typeof value.confidence !== 'undefined') exec.store(NS, 'confidence', value.confidence as any);
  if (typeof value.assessment !== 'undefined') exec.store(NS, 'assessment', value.assessment as any);
  if (typeof value.result !== 'undefined') exec.store(NS, 'result', value.result as any);
  exec.store(NS, 'timestamp', value.timestamp || new Date().toISOString());
}

/**
 * Retrieve the ReadyToFinish decision. Cast to specialized types at callsite when needed.
 */
export function getValidationReadyToFinish<TA extends StorableValue = StorableValue, TR extends StorableValue = StorableValue>(
  exec: Execution,
  pipeline: 'asset-pack' | 'measure' = 'asset-pack'
): ValidationReadyToFinish<TA, TR> | undefined {
  const NS = pipeline === 'measure'
    ? NS_EXEC_MEASURE_VALIDATION_READY_TO_FINISH
    : NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH;
  const approved = exec.get<boolean>(NS, 'approved');
  if (typeof approved === 'undefined') return undefined;
  return {
    approved,
    assessment: exec.get<TA>(NS, 'assessment') ?? null,
    confidence: exec.get<number>(NS, 'confidence') ?? null,
    result: exec.get<TR>(NS, 'result') ?? null,
    timestamp: exec.get<string>(NS, 'timestamp'),
  };
}

// ==================== COMMON NAMESPACES (DOCUMENTED) ====================

/**
 * Canonical namespace index — guides discoverability of stored state.
 * Keep this list curated and in sync with pipelines.
 */
export const EXECUTION_NAMESPACES = {
  execution: [
    'correlationId', // string
    'id',            // string (execution id)
    'dataStream',    // { writeData: (chunk: string) => Promise<void>, close?: () => Promise<void> }
  ],
  pipeline: [
    'input',       // object — normalized pipeline input snapshot
  ],
  source: [
    'connectionId',  // number | string
    'owner',         // string (repo owner)
    'name',          // string (repo name)
    'branch',        // string
    'commit',        // string
  ],
  task: [
    'description',   // string
  ],
  config: [
    'computerUseReadMeasurementEnabled', // boolean — internal V26 feature flag
    'iterationCount',                    // number
    'mcpConfig',                         // object (Evidence Documents / Measure overlay only)
  ],
  attachments: [
    'list',          // array of attachment references
  ],
  evidence_documents: [
    'list',          // array of Evidence Document snippets { content: string; title?: string }
    // iteration:<n> metadata entries may be set dynamically
  ],
  'route/preprocessed': [
    'assetPackWrittenAsset', // object — semantic asset-pack snapshot
    'evidence_documents',  // object — route preprocess snapshot
  ],
  'finish/asset_pack_completion': [
    'summary',          // string | object — synthesis Finish evidence
    'processingStats',  // { time, tokens?, measuredBtd?, feeAsset?, btcFeesPaid? }
    'repoSnapshot',     // { org, repo, branch, commit }
    'writtenAssets',    // semantic written-asset rollups
    'assetPackSynthesisArtifacts', // implementation/finish synthesis artifacts
    'deliveryMechanism', // readiness projection (not buyer-repo settle PR)
    'read',             // semantic expressed read
    'writtenAssetType', // semantic written-asset type
    // settlePassThrough only when settle Simple already stored shippable on EE
    'settlePassThrough',
    // settleDelivery is settle-pipeline exclusive — do not author from synthesis Finish
  ],
  postprocessed: [
    'result',       // normalized postprocessed AssetPack or measurement result
  ],
  // Validation phase
  [NS_EXEC_ASSET_PACK_VALIDATION_READY_TO_FINISH]: [
    'approved', 'confidence', 'assessment', 'result', 'timestamp'
  ],
  [NS_EXEC_MEASURE_VALIDATION_READY_TO_FINISH]: [
    'approved', 'confidence', 'assessment', 'result', 'timestamp'
  ],
} as const;

// ==================== IDENTITY HELPERS ====================

/** Set execution identity fields */
export function setExecutionIdentity(exec: Execution, params: { id?: string; correlationId?: string }): void {
  if (params.id) exec.store('execution', 'id', params.id);
  if (params.correlationId) exec.store('execution', 'correlationId', params.correlationId);
}

/** Get execution id (undefined if not set) */
export function getExecutionId(exec: Execution): string | undefined {
  return exec.get<string>('execution', 'id');
}

/** Get correlation id (undefined if not set) */
export function getCorrelationId(exec: Execution): string | undefined {
  return exec.get<string>('execution', 'correlationId');
}

// ==================== AGENT NAMESPACE FACTORY ====================

/**
 * Compute a canonical agent namespace for execution store keys.
 * Pattern: execution-<pipeline>-pipeline-phase-<phase>-<agent>
 *
 * Example:
 * nsAgent('asset-pack','validation','ready-to-finish-agent')
 *   -> execution-asset-pack-pipeline-phase-validation-ready-to-finish-agent
 */
export function nsAgent(pipeline: 'asset-pack' | 'measure', phase: string, agent: string): string {
  return `execution-${pipeline}-pipeline-phase-${phase}-${agent}`;
}

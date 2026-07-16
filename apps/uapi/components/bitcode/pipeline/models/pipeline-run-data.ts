/**
 * Pipeline run row model for master-detail tables (Deposits, Reads, Packs).
 * Relocated from app/terminal — not product-product vocabulary.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import type { SettleDeliveryDoc } from '@/components/bitcode/pipeline/SettleDeliveryDocPanel/SettleDeliveryDocPanel';
import type { PipelineExecution } from '@/types/api';
// Detail snapshot remains under terminal until its Phase 3 relocate.

export type WorkspaceRun = Pick<PipelineExecution, 'id' | 'created_at' | 'type' | 'agentic_execution' | 'status'> & {
  summary?: string | null;
  /** Source-safe failure message from executions.error (failed/interrupted). */
  errorMessage?: string | null;
  repository?: string | null;
  branch?: string | null;
  sourceCommit?: string | null;
  contextSource?: string | null;
  contextWorkbench?: string | null;
  candidateAssetId?: string | null;
  depositProofRoot?: string | null;
  depositMeasurementRoot?: string | null;
  depositReconciliationReadbackRoot?: string | null;
  depositorySearchDocumentRoot?: string | null;
  lexicalDocumentRoot?: string | null;
  vectorDocumentRoot?: string | null;
  compensationPreviewRoot?: string | null;
  sourceToSharesPreviewRoot?: string | null;
  compensationState?: string | null;
  compensationAllocationMethod?: string | null;
  compensationPriceAsset?: string | null;
  depositorWalletId?: string | null;
  depositoryIndexState?: string | null;
  participant?: string | null;
  sourceModel?: 'execution-history' | 'protocol-projection' | 'mock-review';
  isOwnTransaction?: boolean;
  transactionLens?: 'deposit' | 'read' | 'closure';
  itemCount?: number;
  tokenTotal?: number | null;
  measuredBtd?: number | null;
  btcFeeUsdEquivalent?: number | null;
  averageLatencyMs?: number | null;
  proofStatus?: string | null;
  closureFocus?: string | null;
  protocolProjectionDetail?: unknown | null;
  // V48-Gate3-F13/F18: populated only when contextSource is
  // 'deposit-obfuscations-anchor' — the anchored Obfuscations text itself
  // (plus optional display name and path selections) for the Obfuscations
  // "load a previous anchor" selector.
  obfuscationsAnchorText?: string | null;
  obfuscationsAnchorName?: string | null;
  obfuscationsAnchorPermissibleSources?: string[] | null;
  obfuscationsAnchorImpermissibleSources?: string[] | null;
};

export const MOCK_RUNS: WorkspaceRun[] = [
  {
    id: 'mock-run-branch-remediation',
    created_at: '2026-04-16T12:00:00.000Z',
    type: 'agentic-execution:asset-pack',
    status: 'completed',
    summary: 'Prepared the active branch artifact pack and bounded proof bundle for review.',
    repository: 'bitcode/bitcode',
    branch: 'bitcode/pipeline-refit',
    participant: 'garrett',
    isOwnTransaction: true,
    transactionLens: 'deposit',
    itemCount: 6,
    tokenTotal: 18420,
    measuredBtd: 148.4,
    btcFeeUsdEquivalent: 6.72,
    averageLatencyMs: 1180,
    proofStatus: 'bounded proof bundle ready',
    closureFocus: 'AssetPack evidence + Finish PR mechanism',
  },
  {
    id: 'mock-run-read-measurement-pass',
    created_at: '2026-04-16T11:12:00.000Z',
    type: 'agentic-execution:read-measurement',
    status: 'completed',
    summary: 'Ran a read-measurement pass, surfaced ranked verification evidence, and refreshed ledger posture.',
    repository: 'bitcode/bitcode',
    branch: 'fit-pressure/review',
    participant: 'research-partner',
    isOwnTransaction: false,
    transactionLens: 'read',
    itemCount: 4,
    tokenTotal: 10980,
    measuredBtd: 82.1,
    btcFeeUsdEquivalent: 3.11,
    averageLatencyMs: 920,
    proofStatus: 'verification witness refreshed',
    closureFocus: 'read measurement + ledger refresh',
  },
  {
    id: 'mock-run-proof-refresh',
    created_at: '2026-04-16T10:34:00.000Z',
    type: 'agentic-execution:proof-refresh',
    status: 'running',
    summary: 'Refreshing proof-family witnesses for the current Bitcode operating posture.',
    repository: 'bitcode/bitcode',
    branch: 'proof-refresh/v26',
    participant: 'garrett',
    isOwnTransaction: true,
    transactionLens: 'closure',
    itemCount: 3,
    tokenTotal: 7640,
    measuredBtd: 54.6,
    btcFeeUsdEquivalent: 2.08,
    averageLatencyMs: 1325,
    proofStatus: 'proof-family refresh in flight',
    closureFocus: 'settlement proof + operating posture',
  },
];

const MOCK_RUN_IDS = new Set(MOCK_RUNS.map((run) => run.id));

export function isMockWorkspaceRunId(runId?: string | null) {
  return !!runId && MOCK_RUN_IDS.has(runId);
}

export const MOCK_RUN_ASSET_PACK_SURFACES: Record<string, SettleDeliveryDoc> = {
  'mock-run-branch-remediation': {
    pullRequest: {
      url: 'https://github.com/bitcode/bitcode/pull/268',
      number: 268,
      title: 'Refactor Bitcode pipeline branch-artifact detail surface',
      description:
        'Pulls the remediated branch artifact pack into the selected activity detail and tightens bounded proof grouping.',
    },
    fileChanges: {
      edited: 6,
      created: 2,
      deleted: 0,
      paths: [
        'apps/uapi/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable.tsx',
        'apps/uapi/app/deposits/DepositPageClient.tsx',
      ],
    },
    summary:
      'The branch remediation pack now reads as one Bitcode pipeline surface. You can inspect the proposed pull request and written AssetPack evidence without abandoning the main activity window.',
  },
  'mock-run-read-measurement-pass': {
    pullRequest: null,
    summary:
      'Measurement results were refreshed and tied back into the Bitcode fit-reading model so verification pressure stays readable without leaving the Reads experience.',
  },
  'mock-run-proof-refresh': {
    pullRequest: null,
    summary:
      'Proof-family witnesses are still refreshing. Mock review keeps the pipeline surface legible while the final proof bundle remains in-flight.',
  },
};

export const MOCK_RUN_ACTIVITY: Record<
  string,
  {
    output: string;
    outputDetails: Record<string, any>;
    executionState: Record<string, any>;
    latestWorkUpdate?: any;
    iterationUpdates?: any[];
    isStreamingComplete?: boolean;
    generationCount?: number;
    error?: string | null;
  }
> = {
  'mock-run-branch-remediation': {
    output: [
      '[pipeline:running]',
      '[phase:running] Branch remediation',
      '[agent:running] Branch synthesizer',
      '[completion]',
    ].join('\n'),
    outputDetails: {
      '[pipeline:running]': { type: 'pipeline', status: 'running', timestamp: '2026-04-16T12:00:10.000Z' },
      '[phase:running] Branch remediation': {
        type: 'phase',
        status: 'running',
        phase: 'Branch remediation',
        timestamp: '2026-04-16T12:00:20.000Z',
      },
      '[agent:running] Branch synthesizer': {
        type: 'agent',
        status: 'running',
        agent: 'Branch synthesizer',
        timestamp: '2026-04-16T12:00:26.000Z',
      },
      '[completion]': { type: 'completion', timestamp: '2026-04-16T12:02:00.000Z' },
    },
    executionState: {
      phase: 'Branch remediation',
      agent: 'Branch synthesizer',
      step: 'prepare_concise_context',
      generation: 'Shippable bundle',
    },
    latestWorkUpdate: {
      id: 'wu-1',
      iteration: 2,
      confidence: 0.94,
      prose: 'Remediation branch artifacts and Shippable surfaces are aligned for transaction review.',
      timestamp: '2026-04-16T12:01:40.000Z',
    },
    iterationUpdates: [
      {
        id: 'wu-1',
        iteration: 1,
        confidence: 0.66,
        prose: 'Initial remediation branch bundle prepared.',
        timestamp: '2026-04-16T12:00:48.000Z',
      },
      {
        id: 'wu-2',
        iteration: 2,
        confidence: 0.94,
        prose: 'Remediation branch artifacts and Shippable surfaces are aligned for transaction review.',
        timestamp: '2026-04-16T12:01:40.000Z',
      },
    ],
    isStreamingComplete: true,
    generationCount: 2,
  },
  'mock-run-read-measurement-pass': {
    output: ['[pipeline:running]', '[phase:running] Read measurement refresh', '[completion]'].join('\n'),
    outputDetails: {
      '[pipeline:running]': { type: 'pipeline', status: 'running', timestamp: '2026-04-16T11:12:04.000Z' },
      '[phase:running] Read measurement refresh': {
        type: 'phase',
        status: 'running',
        phase: 'Read measurement refresh',
        timestamp: '2026-04-16T11:12:20.000Z',
      },
      '[completion]': { type: 'completion', timestamp: '2026-04-16T11:13:02.000Z' },
    },
    executionState: {
      phase: 'Read measurement refresh',
      agent: 'Read analyzer',
      step: 'chunk_then_sum',
      generation: 'read verification update',
    },
    latestWorkUpdate: {
      id: 'wu-3',
      iteration: 1,
      confidence: 0.88,
      prose: 'Read-measurement normalization and decisive fit tiers were refreshed for the selected scenario.',
      timestamp: '2026-04-16T11:12:48.000Z',
    },
    iterationUpdates: [
      {
        id: 'wu-3',
        iteration: 1,
        confidence: 0.88,
        prose: 'Read-measurement normalization and decisive fit tiers were refreshed for the selected scenario.',
        timestamp: '2026-04-16T11:12:48.000Z',
      },
    ],
    isStreamingComplete: true,
    generationCount: 1,
  },
  'mock-run-proof-refresh': {
    output: ['[pipeline:running]', '[agent:running] Proof witness generator'].join('\n'),
    outputDetails: {
      '[pipeline:running]': { type: 'pipeline', status: 'running', timestamp: '2026-04-16T10:34:04.000Z' },
      '[agent:running] Proof witness generator': {
        type: 'agent',
        status: 'running',
        agent: 'Proof witness generator',
        timestamp: '2026-04-16T10:34:26.000Z',
      },
    },
    executionState: {
      phase: 'Proof refresh',
      agent: 'Proof witness generator',
      step: 'stitch_until_complete',
      generation: 'proof witness',
    },
    latestWorkUpdate: {
      id: 'wu-4',
      iteration: 1,
      confidence: 0.58,
      prose: 'Proof-family witnesses are still refreshing against the current Bitcode operating posture.',
      timestamp: '2026-04-16T10:35:10.000Z',
    },
    iterationUpdates: [
      {
        id: 'wu-4',
        iteration: 1,
        confidence: 0.58,
        prose: 'Proof-family witnesses are still refreshing against the current Bitcode operating posture.',
        timestamp: '2026-04-16T10:35:10.000Z',
      },
    ],
    isStreamingComplete: false,
    generationCount: 1,
  },
};

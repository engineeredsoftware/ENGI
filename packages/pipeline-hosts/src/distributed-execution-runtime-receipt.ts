import { createHash } from 'node:crypto';

export const DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS = [
  'pipeline_run',
  'ptrr_agent',
  'thinkings_generation',
  'tool_call',
  'ledger_operation',
  'wallet_operation',
  'proof_generation',
  'object_storage_write',
  'repair_job',
] as const;

export type DistributedExecutionRuntimeWorkKind =
  (typeof DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS)[number];

export const DISTRIBUTED_EXECUTION_RUNTIME_HOST_IDS = [
  'website',
  'api',
  'mcp_api',
  'chatgpt_app',
  'pipeline_workers',
  'runtime_observers',
  'ledger_broadcasters',
  'proof_services',
  'repair_jobs',
  'object_storage',
  'database_projection',
  'ledger_projection',
] as const;

export type DistributedExecutionRuntimeHostId =
  (typeof DISTRIBUTED_EXECUTION_RUNTIME_HOST_IDS)[number];

export const DISTRIBUTED_EXECUTION_RUNTIME_LANE_IDS = [
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
] as const;

export type DistributedExecutionRuntimeLaneId =
  (typeof DISTRIBUTED_EXECUTION_RUNTIME_LANE_IDS)[number];

export type DistributedExecutionRuntimeStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'blocked'
  | 'repaired';

export type DistributedExecutionRuntimeRouteBoundary =
  | 'request_response_not_required'
  | 'blocking_allowed_for_short_local_work';

export type DistributedExecutionRuntimePtrrStep = 'plan' | 'try' | 'refine' | 'retry';

export type DistributedExecutionRuntimeThinkingsGenerationStep =
  | 'reason'
  | 'judge'
  | 'structured_output';

export interface DistributedExecutionRuntimeReceiptInput {
  receiptId?: string;
  executionId: string;
  hostId: DistributedExecutionRuntimeHostId;
  laneId: DistributedExecutionRuntimeLaneId;
  workKind: DistributedExecutionRuntimeWorkKind;
  commandOrPipelineId: string;
  status: DistributedExecutionRuntimeStatus;
  routeHandlerBoundary: DistributedExecutionRuntimeRouteBoundary;
  startedAt: string;
  completedAt?: string;
  inputRoot: string;
  outputRoot?: string;
  logRoot: string;
  objectStorageRoot?: string;
  ledgerProjectionRoot?: string;
  databaseProjectionRoot?: string;
  walletOperationRoot?: string;
  proofRoot?: string;
  parentReceiptRoot?: string;
  phaseId?: string;
  agentId?: string;
  ptrrStep?: DistributedExecutionRuntimePtrrStep;
  thinkingsGenerationStep?: DistributedExecutionRuntimeThinkingsGenerationStep;
  toolId?: string;
  repairPosture: string;
  replayCommand: string;
}

export interface DistributedExecutionRuntimeReceipt {
  kind: 'bitcode.distributed_execution_runtime_receipt';
  schemaId: 'bitcode.distributedExecutionRuntimeReceipt.v1';
  receiptId: string;
  executionId: string;
  hostId: DistributedExecutionRuntimeHostId;
  laneId: DistributedExecutionRuntimeLaneId;
  workKind: DistributedExecutionRuntimeWorkKind;
  commandOrPipelineId: string;
  status: DistributedExecutionRuntimeStatus;
  routeHandlerBoundary: DistributedExecutionRuntimeRouteBoundary;
  startedAt: string;
  completedAt?: string;
  inputRoot: string;
  outputRoot?: string;
  logRoot: string;
  objectStorageRoot?: string;
  ledgerProjectionRoot?: string;
  databaseProjectionRoot?: string;
  walletOperationRoot?: string;
  proofRoot?: string;
  parentReceiptRoot?: string;
  phaseId?: string;
  agentId?: string;
  ptrrStep?: DistributedExecutionRuntimePtrrStep;
  thinkingsGenerationStep?: DistributedExecutionRuntimeThinkingsGenerationStep;
  toolId?: string;
  repairPosture: string;
  replayCommand: string;
  protectedSourceVisible: false;
  credentialsSerialized: false;
  sourceSafety: DistributedExecutionRuntimeSourceSafety;
  receiptRoot: string;
}

export interface DistributedExecutionRuntimeSourceSafety {
  sourceSafe: true;
  protectedSourceVisible: false;
  containsProtectedSource: false;
  containsSecret: false;
  credentialsSerialized: false;
}

export interface DistributedExecutionRuntimeReceiptCatalogInput {
  receipts?: readonly DistributedExecutionRuntimeReceiptInput[];
  requiredWorkKinds?: readonly DistributedExecutionRuntimeWorkKind[];
}

export interface DistributedExecutionRuntimeReceiptCatalog {
  kind: 'bitcode.distributed_execution_runtime_receipt_catalog';
  schemaId: 'bitcode.distributedExecutionRuntimeReceiptCatalog.v1';
  catalogRoot: string;
  receiptCount: number;
  requiredWorkKinds: DistributedExecutionRuntimeWorkKind[];
  observedWorkKinds: DistributedExecutionRuntimeWorkKind[];
  missingWorkKinds: DistributedExecutionRuntimeWorkKind[];
  receipts: DistributedExecutionRuntimeReceipt[];
  requestResponseCompletionRequired: false;
  protectedSourceVisible: false;
  credentialsSerialized: false;
  sourceSafety: DistributedExecutionRuntimeSourceSafety;
}

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+key\b/iu,
  /\bwallet\s+seed\b/iu,
  /\bmnemonic\b/iu,
  /\braw\s+source\b/iu,
];

const ROOT_PATTERN = /^(?:sha256|receipt|root):[a-z0-9._:-]{8,}$/iu;

const SOURCE_SAFETY: DistributedExecutionRuntimeSourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
  credentialsSerialized: false,
};

export function buildDistributedExecutionRuntimeReceiptFixtures(): DistributedExecutionRuntimeReceiptInput[] {
  const base = {
    laneId: 'staging-testnet' as const,
    startedAt: '2026-05-22T00:00:00.000Z',
    completedAt: '2026-05-22T00:00:01.000Z',
    routeHandlerBoundary: 'request_response_not_required' as const,
    status: 'succeeded' as const,
    databaseProjectionRoot: 'sha256:database-projection-root',
    logRoot: 'sha256:runtime-log-root',
    replayCommand: 'pnpm run check:v34-gate3',
  };

  return [
    {
      ...base,
      executionId: 'execution-read-fits-finding-synthesis',
      hostId: 'pipeline_workers',
      workKind: 'pipeline_run',
      commandOrPipelineId: 'ReadFitsFindingSynthesis',
      phaseId: 'discovery',
      inputRoot: 'sha256:pipeline-input-root',
      outputRoot: 'sha256:pipeline-output-root',
      objectStorageRoot: 'sha256:pipeline-object-storage-root',
      ledgerProjectionRoot: 'sha256:pipeline-ledger-projection-root',
      proofRoot: 'sha256:pipeline-proof-root',
      repairPosture: 'retry-detached-pipeline-from-input-root',
    },
    {
      ...base,
      executionId: 'execution-read-fits-agent',
      hostId: 'pipeline_workers',
      workKind: 'ptrr_agent',
      commandOrPipelineId: 'ReadFitsFindingSynthesisDiscoveryAgent',
      parentReceiptRoot: 'receipt:pipeline-run-root',
      phaseId: 'discovery',
      agentId: 'ReadFitsFindingSynthesisDiscoveryAgent',
      ptrrStep: 'plan',
      inputRoot: 'sha256:agent-input-root',
      outputRoot: 'sha256:agent-output-root',
      proofRoot: 'sha256:agent-proof-root',
      repairPosture: 'resume-ptrr-agent-from-step-root',
    },
    {
      ...base,
      executionId: 'execution-thinkings-generation',
      hostId: 'pipeline_workers',
      workKind: 'thinkings_generation',
      commandOrPipelineId: 'ReadFitsFindingSynthesisDiscoveryAgent.plan.reason',
      parentReceiptRoot: 'receipt:ptrr-agent-root',
      phaseId: 'discovery',
      agentId: 'ReadFitsFindingSynthesisDiscoveryAgent',
      ptrrStep: 'plan',
      thinkingsGenerationStep: 'reason',
      inputRoot: 'sha256:generation-input-root',
      outputRoot: 'sha256:generation-output-root',
      proofRoot: 'sha256:generation-proof-root',
      repairPosture: 'regenerate-from-redacted-prompt-and-context-root',
    },
    {
      ...base,
      executionId: 'execution-depository-search-tool',
      hostId: 'pipeline_workers',
      workKind: 'tool_call',
      commandOrPipelineId: 'AssetPackLexicalDepositorySearchTool',
      parentReceiptRoot: 'receipt:thinkings-generation-root',
      phaseId: 'discovery',
      agentId: 'ReadFitsFindingSynthesisDiscoveryAgent',
      ptrrStep: 'try',
      toolId: 'AssetPackLexicalDepositorySearchTool',
      inputRoot: 'sha256:tool-input-root',
      outputRoot: 'sha256:tool-output-root',
      proofRoot: 'sha256:tool-proof-root',
      repairPosture: 'rerun-tool-from-input-root-with-source-safe-query',
    },
    {
      ...base,
      executionId: 'execution-ledger-operation',
      hostId: 'ledger_projection',
      workKind: 'ledger_operation',
      commandOrPipelineId: 'ledger.project.read-rights',
      inputRoot: 'sha256:ledger-input-root',
      outputRoot: 'sha256:ledger-output-root',
      ledgerProjectionRoot: 'sha256:ledger-projection-root',
      proofRoot: 'sha256:ledger-proof-root',
      repairPosture: 'hold-unlock-and-replay-ledger-projection',
    },
    {
      ...base,
      executionId: 'execution-wallet-operation',
      hostId: 'ledger_broadcasters',
      laneId: 'signet',
      workKind: 'wallet_operation',
      commandOrPipelineId: 'btc.fee.sign-and-broadcast',
      inputRoot: 'sha256:wallet-input-root',
      outputRoot: 'sha256:wallet-output-root',
      walletOperationRoot: 'sha256:wallet-operation-root',
      proofRoot: 'sha256:wallet-proof-root',
      repairPosture: 'deny-broadcast-until-wallet-policy-repaired',
    },
    {
      ...base,
      executionId: 'execution-proof-generation',
      hostId: 'proof_services',
      workKind: 'proof_generation',
      commandOrPipelineId: 'v34.deployment.proof.generate',
      inputRoot: 'sha256:proof-input-root',
      outputRoot: 'sha256:proof-output-root',
      proofRoot: 'sha256:proof-generation-root',
      repairPosture: 'regenerate-proof-from-canonical-inputs',
    },
    {
      ...base,
      executionId: 'execution-object-storage-write',
      hostId: 'object_storage',
      workKind: 'object_storage_write',
      commandOrPipelineId: 'assetpack.preview.persist',
      inputRoot: 'sha256:object-storage-input-root',
      outputRoot: 'sha256:object-storage-output-root',
      objectStorageRoot: 'sha256:object-storage-root',
      proofRoot: 'sha256:object-storage-proof-root',
      repairPosture: 'lock-delivery-and-rewrite-from-authorized-artifact-root',
    },
    {
      ...base,
      executionId: 'execution-repair-job',
      hostId: 'repair_jobs',
      workKind: 'repair_job',
      commandOrPipelineId: 'projection.repair',
      status: 'repaired',
      inputRoot: 'sha256:repair-input-root',
      outputRoot: 'sha256:repair-output-root',
      objectStorageRoot: 'sha256:repair-object-storage-root',
      ledgerProjectionRoot: 'sha256:repair-ledger-projection-root',
      proofRoot: 'sha256:repair-proof-root',
      repairPosture: 'repair-complete-with-replayable-proof-root',
    },
  ];
}

export function buildDistributedExecutionRuntimeReceipt(
  input: DistributedExecutionRuntimeReceiptInput,
): DistributedExecutionRuntimeReceipt {
  const workKind = assertWorkKind(input.workKind);
  const hostId = assertHostId(input.hostId);
  const laneId = assertLaneId(input.laneId);
  const status = assertStatus(input.status);
  const routeHandlerBoundary = assertRouteBoundary(input.routeHandlerBoundary);
  const receiptId =
    input.receiptId ??
    stableRoot('distributed-execution-runtime-receipt-id', [
      input.executionId,
      hostId,
      laneId,
      workKind,
      input.commandOrPipelineId,
      input.inputRoot,
    ]);

  const receipt = {
    kind: 'bitcode.distributed_execution_runtime_receipt' as const,
    schemaId: 'bitcode.distributedExecutionRuntimeReceipt.v1' as const,
    receiptId: assertSourceSafeString(receiptId, 'receiptId'),
    executionId: assertSourceSafeString(input.executionId, 'executionId'),
    hostId,
    laneId,
    workKind,
    commandOrPipelineId: assertSourceSafeString(input.commandOrPipelineId, 'commandOrPipelineId'),
    status,
    routeHandlerBoundary,
    startedAt: assertSourceSafeString(input.startedAt, 'startedAt'),
    completedAt: input.completedAt
      ? assertSourceSafeString(input.completedAt, 'completedAt')
      : undefined,
    inputRoot: assertRoot(input.inputRoot, 'inputRoot'),
    outputRoot: input.outputRoot ? assertRoot(input.outputRoot, 'outputRoot') : undefined,
    logRoot: assertRoot(input.logRoot, 'logRoot'),
    objectStorageRoot: input.objectStorageRoot
      ? assertRoot(input.objectStorageRoot, 'objectStorageRoot')
      : undefined,
    ledgerProjectionRoot: input.ledgerProjectionRoot
      ? assertRoot(input.ledgerProjectionRoot, 'ledgerProjectionRoot')
      : undefined,
    databaseProjectionRoot: input.databaseProjectionRoot
      ? assertRoot(input.databaseProjectionRoot, 'databaseProjectionRoot')
      : undefined,
    walletOperationRoot: input.walletOperationRoot
      ? assertRoot(input.walletOperationRoot, 'walletOperationRoot')
      : undefined,
    proofRoot: input.proofRoot ? assertRoot(input.proofRoot, 'proofRoot') : undefined,
    parentReceiptRoot: input.parentReceiptRoot
      ? assertRoot(input.parentReceiptRoot, 'parentReceiptRoot')
      : undefined,
    phaseId: input.phaseId ? assertSourceSafeString(input.phaseId, 'phaseId') : undefined,
    agentId: input.agentId ? assertSourceSafeString(input.agentId, 'agentId') : undefined,
    ptrrStep: input.ptrrStep ? assertPtrrStep(input.ptrrStep) : undefined,
    thinkingsGenerationStep: input.thinkingsGenerationStep
      ? assertThinkingsGenerationStep(input.thinkingsGenerationStep)
      : undefined,
    toolId: input.toolId ? assertSourceSafeString(input.toolId, 'toolId') : undefined,
    repairPosture: assertSourceSafeString(input.repairPosture, 'repairPosture'),
    replayCommand: assertSourceSafeString(input.replayCommand, 'replayCommand'),
    protectedSourceVisible: false as const,
    credentialsSerialized: false as const,
    sourceSafety: SOURCE_SAFETY,
  };

  assertReceiptInvariants(receipt);

  return {
    ...receipt,
    receiptRoot: stableRoot('distributed-execution-runtime-receipt', [
      receipt.receiptId,
      receipt.executionId,
      receipt.hostId,
      receipt.laneId,
      receipt.workKind,
      receipt.commandOrPipelineId,
      receipt.status,
      receipt.routeHandlerBoundary,
      receipt.inputRoot,
      receipt.outputRoot ?? 'pending-output',
      receipt.logRoot,
      receipt.objectStorageRoot ?? 'no-object-storage-root',
      receipt.ledgerProjectionRoot ?? 'no-ledger-root',
      receipt.databaseProjectionRoot ?? 'no-database-root',
      receipt.walletOperationRoot ?? 'no-wallet-root',
      receipt.proofRoot ?? 'no-proof-root',
      receipt.parentReceiptRoot ?? 'root-receipt',
      receipt.phaseId ?? 'no-phase',
      receipt.agentId ?? 'no-agent',
      receipt.ptrrStep ?? 'no-ptrr-step',
      receipt.thinkingsGenerationStep ?? 'no-thinkings-generation-step',
      receipt.toolId ?? 'no-tool',
      receipt.repairPosture,
      receipt.replayCommand,
    ]),
  };
}

export function buildDistributedExecutionRuntimeReceiptCatalog(
  input: DistributedExecutionRuntimeReceiptCatalogInput = {},
): DistributedExecutionRuntimeReceiptCatalog {
  const receipts = (input.receipts ?? buildDistributedExecutionRuntimeReceiptFixtures()).map(
    buildDistributedExecutionRuntimeReceipt,
  );
  const requiredWorkKinds = [
    ...(input.requiredWorkKinds ?? DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS),
  ];
  const observedWorkKinds = Array.from(new Set(receipts.map((receipt) => receipt.workKind))).sort();
  const missingWorkKinds = requiredWorkKinds.filter(
    (workKind) => !observedWorkKinds.includes(workKind),
  );
  const duplicateReceiptIds = findDuplicates(receipts.map((receipt) => receipt.receiptId));

  if (missingWorkKinds.length) {
    throw new Error(`Distributed execution runtime receipts missing work kinds: ${missingWorkKinds.join(', ')}.`);
  }
  if (duplicateReceiptIds.length) {
    throw new Error(`Distributed execution runtime receipts contain duplicate receipt ids: ${duplicateReceiptIds.join(', ')}.`);
  }

  return {
    kind: 'bitcode.distributed_execution_runtime_receipt_catalog',
    schemaId: 'bitcode.distributedExecutionRuntimeReceiptCatalog.v1',
    catalogRoot: stableRoot('distributed-execution-runtime-receipt-catalog', [
      ...receipts.map((receipt) => receipt.receiptRoot),
      requiredWorkKinds.join(','),
    ]),
    receiptCount: receipts.length,
    requiredWorkKinds,
    observedWorkKinds,
    missingWorkKinds,
    receipts,
    requestResponseCompletionRequired: false,
    protectedSourceVisible: false,
    credentialsSerialized: false,
    sourceSafety: SOURCE_SAFETY,
  };
}

function assertReceiptInvariants(
  receipt: Omit<DistributedExecutionRuntimeReceipt, 'receiptRoot'>,
): void {
  if (
    receipt.routeHandlerBoundary === 'blocking_allowed_for_short_local_work' &&
    receipt.laneId !== 'local'
  ) {
    throw new Error('Blocking route handler completion is only allowed for short local work.');
  }
  if (receipt.routeHandlerBoundary !== 'request_response_not_required') {
    if (receipt.workKind !== 'tool_call' && receipt.status === 'running') {
      throw new Error('Long-running distributed work must not require request/response completion.');
    }
  }
  if (['succeeded', 'failed', 'blocked', 'repaired'].includes(receipt.status)) {
    if (!receipt.completedAt) {
      throw new Error('product distributed execution receipts require completedAt.');
    }
  }
  if (['succeeded', 'repaired'].includes(receipt.status) && !receipt.outputRoot) {
    throw new Error('Successful or repaired distributed execution receipts require outputRoot.');
  }
  if (receipt.workKind === 'ptrr_agent' && !receipt.agentId) {
    throw new Error('PTRR agent receipts require agentId.');
  }
  if (receipt.workKind === 'thinkings_generation') {
    if (!receipt.agentId || !receipt.ptrrStep || !receipt.thinkingsGenerationStep) {
      throw new Error('ThinkingsGeneration receipts require agentId, PTRR step, and generation step.');
    }
  }
  if (receipt.workKind === 'tool_call' && !receipt.toolId) {
    throw new Error('Tool call receipts require toolId.');
  }
  if (receipt.workKind === 'ledger_operation' && !receipt.ledgerProjectionRoot) {
    throw new Error('Ledger operation receipts require ledgerProjectionRoot.');
  }
  if (receipt.workKind === 'wallet_operation' && !receipt.walletOperationRoot) {
    throw new Error('Wallet operation receipts require walletOperationRoot.');
  }
  if (receipt.workKind === 'proof_generation' && !receipt.proofRoot) {
    throw new Error('Proof generation receipts require proofRoot.');
  }
  if (receipt.workKind === 'object_storage_write' && !receipt.objectStorageRoot) {
    throw new Error('Object storage write receipts require objectStorageRoot.');
  }
  if (receipt.workKind === 'repair_job' && !receipt.outputRoot) {
    throw new Error('Repair job receipts require outputRoot.');
  }
}

function assertWorkKind(workKind: string): DistributedExecutionRuntimeWorkKind {
  if (!DISTRIBUTED_EXECUTION_RUNTIME_WORK_KINDS.includes(workKind as DistributedExecutionRuntimeWorkKind)) {
    throw new Error(`Unsupported distributed execution runtime work kind: ${workKind}.`);
  }

  return workKind as DistributedExecutionRuntimeWorkKind;
}

function assertHostId(hostId: string): DistributedExecutionRuntimeHostId {
  if (!DISTRIBUTED_EXECUTION_RUNTIME_HOST_IDS.includes(hostId as DistributedExecutionRuntimeHostId)) {
    throw new Error(`Unsupported distributed execution runtime host id: ${hostId}.`);
  }

  return hostId as DistributedExecutionRuntimeHostId;
}

function assertLaneId(laneId: string): DistributedExecutionRuntimeLaneId {
  if (!DISTRIBUTED_EXECUTION_RUNTIME_LANE_IDS.includes(laneId as DistributedExecutionRuntimeLaneId)) {
    throw new Error(`Unsupported distributed execution runtime lane id: ${laneId}.`);
  }

  return laneId as DistributedExecutionRuntimeLaneId;
}

function assertStatus(status: string): DistributedExecutionRuntimeStatus {
  const allowed: readonly DistributedExecutionRuntimeStatus[] = [
    'queued',
    'running',
    'succeeded',
    'failed',
    'blocked',
    'repaired',
  ];
  if (!allowed.includes(status as DistributedExecutionRuntimeStatus)) {
    throw new Error(`Unsupported distributed execution runtime status: ${status}.`);
  }

  return status as DistributedExecutionRuntimeStatus;
}

function assertRouteBoundary(boundary: string): DistributedExecutionRuntimeRouteBoundary {
  const allowed: readonly DistributedExecutionRuntimeRouteBoundary[] = [
    'request_response_not_required',
    'blocking_allowed_for_short_local_work',
  ];
  if (!allowed.includes(boundary as DistributedExecutionRuntimeRouteBoundary)) {
    throw new Error(`Unsupported distributed execution route boundary: ${boundary}.`);
  }

  return boundary as DistributedExecutionRuntimeRouteBoundary;
}

function assertPtrrStep(step: string): DistributedExecutionRuntimePtrrStep {
  const allowed: readonly DistributedExecutionRuntimePtrrStep[] = ['plan', 'try', 'refine', 'retry'];
  if (!allowed.includes(step as DistributedExecutionRuntimePtrrStep)) {
    throw new Error(`Unsupported PTRR step: ${step}.`);
  }

  return step as DistributedExecutionRuntimePtrrStep;
}

function assertThinkingsGenerationStep(
  step: string,
): DistributedExecutionRuntimeThinkingsGenerationStep {
  const allowed: readonly DistributedExecutionRuntimeThinkingsGenerationStep[] = [
    'reason',
    'judge',
    'structured_output',
  ];
  if (!allowed.includes(step as DistributedExecutionRuntimeThinkingsGenerationStep)) {
    throw new Error(`Unsupported ThinkingsGeneration step: ${step}.`);
  }

  return step as DistributedExecutionRuntimeThinkingsGenerationStep;
}

function assertRoot(root: string, label: string): string {
  const text = assertSourceSafeString(root, label);
  if (!ROOT_PATTERN.test(text)) {
    throw new Error(`${label} must be a source-safe root.`);
  }

  return text;
}

function assertSourceSafeString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new Error(`${label} must not contain secrets or non-disclosable source.`);
  }

  return value;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }

  return [...duplicate].sort();
}

function stableRoot(prefix: string, parts: string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

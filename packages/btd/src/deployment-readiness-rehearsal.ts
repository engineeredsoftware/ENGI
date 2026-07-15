import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import {
  DEPLOYMENT_HOST_CAPABILITY_IDS,
  ENVIRONMENT_LANE_CONTRACT_IDS,
  type DeploymentHostCapabilityId,
  type EnvironmentLaneContractId,
} from './deployment-host-capability-catalog';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const DEPLOYMENT_READINESS_REHEARSAL_IDS = [
  'local_full_stack_rehearsal',
  'staging_testnet_full_stack_rehearsal',
  'value_bearing_mainnet_blocked_rehearsal',
] as const;

export type DeploymentReadinessRehearsalId =
  (typeof DEPLOYMENT_READINESS_REHEARSAL_IDS)[number];

export type DeploymentReadinessRehearsalSurface =
  | 'product'
  | 'public_api'
  | 'mcp_api'
  | 'chatgpt_app'
  | 'reading_pipeline_execution_receipts'
  | 'settlement_finality_simulation'
  | 'storage_posture'
  | 'repair_posture';

export type DeploymentReadinessAdmissionVerdict =
  | 'admitted_non_value_rehearsal'
  | 'blocked_value_bearing_mainnet';

export interface DeploymentReadinessRehearsalInput {
  rehearsalId: DeploymentReadinessRehearsalId;
  label: string;
  laneId: EnvironmentLaneContractId;
  hostIds: readonly DeploymentHostCapabilityId[];
  exercisedSurfaces: readonly DeploymentReadinessRehearsalSurface[];
  runtimeReceiptIds: readonly string[];
  proofBundlePaths: readonly string[];
  sourceSafeLogKinds: readonly string[];
  screenshotOrLogRoots: readonly string[];
  validationCommands: readonly string[];
  settlementFinalitySimulation: string;
  storagePostureChecks: readonly string[];
  repairPostureChecks: readonly string[];
  valueBearingMainnetAdmission: false;
  admissionVerdict: DeploymentReadinessAdmissionVerdict;
  failClosedResult: string;
  proofRootBasis: readonly string[];
  auditEventName: string;
}

export interface DeploymentReadinessRehearsal extends DeploymentReadinessRehearsalInput {
  kind: 'bitcode.deployment_readiness_rehearsal';
  hostIds: DeploymentHostCapabilityId[];
  exercisedSurfaces: DeploymentReadinessRehearsalSurface[];
  runtimeReceiptIds: string[];
  proofBundlePaths: string[];
  sourceSafeLogKinds: string[];
  screenshotOrLogRoots: string[];
  validationCommands: string[];
  storagePostureChecks: string[];
  repairPostureChecks: string[];
  proofRootBasis: string[];
  rehearsalRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface DeploymentReadinessRehearsalSetInput {
  rehearsals?: readonly DeploymentReadinessRehearsalInput[];
  requiredRehearsalIds?: readonly DeploymentReadinessRehearsalId[];
}

export interface DeploymentReadinessRehearsalSet {
  kind: 'bitcode.deployment_readiness_rehearsal_set';
  schemaId: 'bitcode.deploymentReadinessRehearsalSet.v1';
  rehearsalSetRoot: string;
  rehearsalCount: number;
  requiredRehearsalIds: DeploymentReadinessRehearsalId[];
  observedRehearsalIds: DeploymentReadinessRehearsalId[];
  missingRehearsalIds: DeploymentReadinessRehearsalId[];
  rehearsals: DeploymentReadinessRehearsal[];
  localRehearsalCovered: true;
  stagingTestnetRehearsalCovered: true;
  terminalCovered: true;
  publicApiCovered: true;
  mcpApiCovered: true;
  chatGptAppCovered: true;
  readingPipelineExecutionReceiptsCovered: true;
  settlementFinalitySimulationCovered: true;
  storagePostureCovered: true;
  repairPostureCovered: true;
  sourceSafeLogsCovered: true;
  screenshotsOrLogsProofRooted: true;
  validationCommandsCovered: true;
  proofRootsCovered: true;
  noSerializedSecretValues: true;
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

const FULL_STACK_SURFACES: DeploymentReadinessRehearsalSurface[] = [
  'product',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'reading_pipeline_execution_receipts',
  'settlement_finality_simulation',
  'storage_posture',
  'repair_posture',
];

const NON_VALUE_LANES: EnvironmentLaneContractId[] = [
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
];

const SECRET_OR_SOURCE_PATTERNS = [
  new RegExp(`${['sb', 'secret'].join('_')}__`, 'iu'),
  /\bsk-(?:proj|live|test)?[-_A-Za-z0-9]{16,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\bprivate\s+key\b/iu,
  /\bwallet\s+seed\b/iu,
  /\bmnemonic\b/iu,
  /\braw\s+source\b/iu,
  /\bsource\s+contents\b/iu,
  /\b[A-Z][A-Z0-9_]{2,}\s*=\s*[^<\s][^\s]*/u,
];

export function buildDeploymentReadinessRehearsalRows(): DeploymentReadinessRehearsalInput[] {
  return [
    fullStackRow(
      'local_full_stack_rehearsal',
      'local full-stack deployment rehearsal',
      'local',
      [
        'terminal-local-log-root',
        'api-local-contract-log-root',
        'mcp-local-contract-log-root',
        'chatgpt-app-local-contract-log-root',
        'pipeline-local-runtime-receipt-log-root',
      ],
      'local settlement and finality use non-value regtest simulation with delivery locked until receipt roots agree',
    ),
    fullStackRow(
      'staging_testnet_full_stack_rehearsal',
      'staging-testnet full-stack deployment rehearsal',
      'staging-testnet',
      [
        'terminal-staging-testnet-log-root',
        'api-staging-testnet-contract-log-root',
        'mcp-staging-testnet-contract-log-root',
        'chatgpt-app-staging-testnet-contract-log-root',
        'pipeline-staging-testnet-runtime-receipt-log-root',
      ],
      'staging-testnet settlement and finality use testnet rehearsal with protected AssetPack source locked before paid unlock',
    ),
    {
      rehearsalId: 'value_bearing_mainnet_blocked_rehearsal',
      label: 'value-bearing mainnet blocked rehearsal',
      laneId: 'value-bearing-mainnet',
      hostIds: ['website', 'api', 'ledger_broadcasters', 'runtime_observers', 'repair_jobs'],
      exercisedSurfaces: ['settlement_finality_simulation', 'storage_posture', 'repair_posture'],
      runtimeReceiptIds: ['receipt.value-bearing-mainnet.blocked-admission'],
      proofBundlePaths: ['proof-bundle/value-bearing-mainnet-blocked-rehearsal'],
      sourceSafeLogKinds: ['blocked-admission-log-root', 'operator-denial-log-root'],
      screenshotOrLogRoots: ['mainnet-blocked-admission-log-root'],
      validationCommands: [
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/deployment-readiness-rehearsal.test.ts',
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
      ],
      settlementFinalitySimulation: 'value-bearing mainnet settlement is represented only as blocked admission without broadcast or source unlock',
      storagePostureChecks: ['protected AssetPack source stays locked', 'object storage write remains denied'],
      repairPostureChecks: ['unlock repair remains blocked', 'mainnet broadcaster remains denied'],
      valueBearingMainnetAdmission: false,
      admissionVerdict: 'blocked_value_bearing_mainnet',
      failClosedResult: 'value-bearing mainnet remains blocked until a future canon explicitly admits it',
      proofRootBasis: ['EnvironmentLaneContract', 'BtcFeeQuote', 'SettlementUnlock', 'RuntimeObserverRepairJob'],
      auditEventName: 'deployment_readiness.value_bearing_mainnet_blocked',
    },
  ];
}

export function buildDeploymentReadinessRehearsal(
  input: DeploymentReadinessRehearsalInput,
): DeploymentReadinessRehearsal {
  const rehearsalId = assertRehearsalId(input.rehearsalId);
  const laneId = assertEnvironmentLaneContractId(input.laneId);
  const rehearsal = {
    kind: 'bitcode.deployment_readiness_rehearsal' as const,
    rehearsalId,
    label: assertSourceSafeString(input.label, 'label'),
    laneId,
    hostIds: input.hostIds.map(assertDeploymentHostCapabilityId),
    exercisedSurfaces: input.exercisedSurfaces.map(assertSurface),
    runtimeReceiptIds: input.runtimeReceiptIds.map((receiptId) => assertSourceSafeString(receiptId, 'runtimeReceiptIds')),
    proofBundlePaths: input.proofBundlePaths.map((proofPath) => assertSourceSafeString(proofPath, 'proofBundlePaths')),
    sourceSafeLogKinds: input.sourceSafeLogKinds.map((logKind) => assertSourceSafeString(logKind, 'sourceSafeLogKinds')),
    screenshotOrLogRoots: input.screenshotOrLogRoots.map((root) => assertSourceSafeString(root, 'screenshotOrLogRoots')),
    validationCommands: input.validationCommands.map((command) => assertSourceSafeString(command, 'validationCommands')),
    settlementFinalitySimulation: assertSourceSafeString(input.settlementFinalitySimulation, 'settlementFinalitySimulation'),
    storagePostureChecks: input.storagePostureChecks.map((check) => assertSourceSafeString(check, 'storagePostureChecks')),
    repairPostureChecks: input.repairPostureChecks.map((check) => assertSourceSafeString(check, 'repairPostureChecks')),
    valueBearingMainnetAdmission: input.valueBearingMainnetAdmission,
    admissionVerdict: assertAdmissionVerdict(input.admissionVerdict),
    failClosedResult: assertSourceSafeString(input.failClosedResult, 'failClosedResult'),
    proofRootBasis: input.proofRootBasis.map((basis) => assertSourceSafeString(basis, 'proofRootBasis')),
    auditEventName: assertSourceSafeString(input.auditEventName, 'auditEventName'),
    sourceSafety: SOURCE_SAFETY,
  };

  assertRehearsalInvariants(rehearsal);

  return {
    ...rehearsal,
    rehearsalRoot: stableRoot('deployment-readiness-rehearsal', [
      rehearsal.rehearsalId,
      rehearsal.label,
      rehearsal.laneId,
      rehearsal.hostIds.join(','),
      rehearsal.exercisedSurfaces.join(','),
      rehearsal.runtimeReceiptIds.join(','),
      rehearsal.proofBundlePaths.join(','),
      rehearsal.sourceSafeLogKinds.join(','),
      rehearsal.screenshotOrLogRoots.join(','),
      rehearsal.validationCommands.join(','),
      rehearsal.settlementFinalitySimulation,
      rehearsal.storagePostureChecks.join(','),
      rehearsal.repairPostureChecks.join(','),
      String(rehearsal.valueBearingMainnetAdmission),
      rehearsal.admissionVerdict,
      rehearsal.failClosedResult,
      rehearsal.proofRootBasis.join(','),
      rehearsal.auditEventName,
    ]),
  };
}

export function buildDeploymentReadinessRehearsalSet(
  input: DeploymentReadinessRehearsalSetInput = {},
): DeploymentReadinessRehearsalSet {
  const requiredRehearsalIds = [
    ...(input.requiredRehearsalIds ?? DEPLOYMENT_READINESS_REHEARSAL_IDS),
  ];
  const rehearsals = (input.rehearsals ?? buildDeploymentReadinessRehearsalRows()).map(
    buildDeploymentReadinessRehearsal,
  );
  const observedRehearsalIds = Array.from(
    new Set(rehearsals.map((rehearsal) => rehearsal.rehearsalId)),
  ).sort();
  const missingRehearsalIds = requiredRehearsalIds.filter(
    (rehearsalId) => !observedRehearsalIds.includes(rehearsalId),
  );
  const duplicateRehearsalIds = findDuplicates(rehearsals.map((rehearsal) => rehearsal.rehearsalId));

  if (missingRehearsalIds.length) {
    throw new Error(`Deployment readiness rehearsals missing required rehearsals: ${missingRehearsalIds.join(', ')}.`);
  }
  if (duplicateRehearsalIds.length) {
    throw new Error(`Deployment readiness rehearsals contain duplicate rehearsal ids: ${duplicateRehearsalIds.join(', ')}.`);
  }

  const hasLocal = rehearsals.some((rehearsal) => rehearsal.laneId === 'local');
  const hasStaging = rehearsals.some((rehearsal) => rehearsal.laneId === 'staging-testnet');
  const localAndStaging = rehearsals.filter((rehearsal) =>
    rehearsal.laneId === 'local' || rehearsal.laneId === 'staging-testnet',
  );
  const coversSurface = (surface: DeploymentReadinessRehearsalSurface) =>
    localAndStaging.every((rehearsal) => rehearsal.exercisedSurfaces.includes(surface));
  const sourceSafeLogsCovered = rehearsals.every((rehearsal) =>
    rehearsal.sourceSafeLogKinds.length > 0 && rehearsal.sourceSafeLogKinds.every((logKind) => /log-root/iu.test(logKind)),
  );
  const proofRootedLogs = rehearsals.every((rehearsal) =>
    rehearsal.screenshotOrLogRoots.length > 0 && rehearsal.proofBundlePaths.length > 0,
  );
  const validationCommandsCovered = rehearsals.every((rehearsal) => rehearsal.validationCommands.length > 0);
  const proofRootsCovered = rehearsals.every((rehearsal) => rehearsal.proofRootBasis.length > 0);
  const valueBearingMainnetBlocked = rehearsals.every((rehearsal) =>
    rehearsal.laneId !== 'value-bearing-mainnet' ||
    (rehearsal.valueBearingMainnetAdmission === false &&
      rehearsal.admissionVerdict === 'blocked_value_bearing_mainnet'),
  );

  if (!hasLocal) throw new Error('Deployment readiness rehearsals require a local rehearsal.');
  if (!hasStaging) throw new Error('Deployment readiness rehearsals require a staging-testnet rehearsal.');
  for (const surface of FULL_STACK_SURFACES) {
    if (!coversSurface(surface)) {
      throw new Error(`Deployment readiness rehearsals require local and staging-testnet coverage for ${surface}.`);
    }
  }
  if (!sourceSafeLogsCovered) throw new Error('Deployment readiness rehearsals require source-safe log roots.');
  if (!proofRootedLogs) throw new Error('Deployment readiness rehearsals require proof-rooted screenshots or logs.');
  if (!validationCommandsCovered) throw new Error('Deployment readiness rehearsals require validation commands.');
  if (!proofRootsCovered) throw new Error('Deployment readiness rehearsals require proof roots.');
  if (!valueBearingMainnetBlocked) throw new Error('Deployment readiness rehearsals must keep value-bearing mainnet blocked.');

  return {
    kind: 'bitcode.deployment_readiness_rehearsal_set',
    schemaId: 'bitcode.deploymentReadinessRehearsalSet.v1',
    rehearsalSetRoot: stableRoot('deployment-readiness-rehearsal-set', [
      ...rehearsals.map((rehearsal) => rehearsal.rehearsalRoot),
      requiredRehearsalIds.join(','),
    ]),
    rehearsalCount: rehearsals.length,
    requiredRehearsalIds,
    observedRehearsalIds,
    missingRehearsalIds,
    rehearsals,
    localRehearsalCovered: true,
    stagingTestnetRehearsalCovered: true,
    terminalCovered: true,
    publicApiCovered: true,
    mcpApiCovered: true,
    chatGptAppCovered: true,
    readingPipelineExecutionReceiptsCovered: true,
    settlementFinalitySimulationCovered: true,
    storagePostureCovered: true,
    repairPostureCovered: true,
    sourceSafeLogsCovered: true,
    screenshotsOrLogsProofRooted: true,
    validationCommandsCovered: true,
    proofRootsCovered: true,
    noSerializedSecretValues: true,
    valueBearingMainnetBlocked: true,
    sourceSafety: SOURCE_SAFETY,
  };
}

function fullStackRow(
  rehearsalId: DeploymentReadinessRehearsalId,
  label: string,
  laneId: EnvironmentLaneContractId,
  screenshotOrLogRoots: string[],
  settlementFinalitySimulation: string,
): DeploymentReadinessRehearsalInput {
  return {
    rehearsalId,
    label,
    laneId,
    hostIds: ['website', 'api', 'mcp_api', 'chatgpt_app', 'pipeline_workers', 'runtime_observers', 'ledger_broadcasters', 'object_storage', 'database_projection', 'repair_jobs'],
    exercisedSurfaces: FULL_STACK_SURFACES,
    runtimeReceiptIds: [
      `receipt.${laneId}.terminal`,
      `receipt.${laneId}.public-api`,
      `receipt.${laneId}.mcp-api`,
      `receipt.${laneId}.chatgpt-app`,
      `receipt.${laneId}.reading-pipeline`,
      `receipt.${laneId}.settlement-finality`,
      `receipt.${laneId}.storage-repair`,
    ],
    proofBundlePaths: [
      `proof-bundle/${laneId}/terminal`,
      `proof-bundle/${laneId}/api`,
      `proof-bundle/${laneId}/mcp`,
      `proof-bundle/${laneId}/chatgpt-app`,
      `proof-bundle/${laneId}/reading-pipeline`,
      `proof-bundle/${laneId}/settlement-storage-repair`,
    ],
    sourceSafeLogKinds: [
      'terminal-screenshot-log-root',
      'public-api-contract-log-root',
      'mcp-api-contract-log-root',
      'chatgpt-app-contract-log-root',
      'reading-pipeline-runtime-receipt-log-root',
      'settlement-finality-simulation-log-root',
      'storage-repair-posture-log-root',
    ],
    screenshotOrLogRoots,
    validationCommands: [
      'pnpm --dir apps/uapi run test:e2e:terminal-ux',
      'pnpm --filter @bitcode/api build',
      'pnpm --dir apps/mcp run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/chatgpt-action-contract.test.ts src/__tests__/tools.test.ts --runInBand',
      'pnpm run qa:pipeline-readback',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/deployment-storage-posture.test.ts',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/runtime-observer-repair-job.test.ts',
    ],
    settlementFinalitySimulation,
    storagePostureChecks: ['ledger-derived state readback', 'database projection readback', 'object-storage source lock', 'generated proof artifact root'],
    repairPostureChecks: ['observer repair replay command', 'rollback repair playbook availability', 'blocked unlock on drift'],
    valueBearingMainnetAdmission: false,
    admissionVerdict: 'admitted_non_value_rehearsal',
    failClosedResult: 'deployment rehearsal remains blocked when any runtime receipt, log root, storage root, or repair root is missing',
    proofRootBasis: [
      'DeploymentHostCapabilityCatalog',
      'EnvironmentLaneContract',
      'DistributedExecutionRuntimeReceipt',
      'DeploymentStoragePosture',
      'RuntimeObserverRepairJob',
      'RollbackUpgradeRepairPlaybook',
    ],
    auditEventName: `deployment_readiness.${rehearsalId}`,
  };
}

function assertRehearsalInvariants(
  rehearsal: Omit<DeploymentReadinessRehearsal, 'rehearsalRoot'>,
): void {
  if (rehearsal.laneId !== 'value-bearing-mainnet' && !NON_VALUE_LANES.includes(rehearsal.laneId)) {
    throw new Error(`Unsupported deployment readiness rehearsal lane: ${rehearsal.laneId}.`);
  }
  if (rehearsal.laneId === 'value-bearing-mainnet' && rehearsal.admissionVerdict !== 'blocked_value_bearing_mainnet') {
    throw new Error('Deployment readiness rehearsals must keep value-bearing mainnet blocked.');
  }
  if (rehearsal.valueBearingMainnetAdmission !== false) {
    throw new Error('Deployment readiness rehearsals must not admit value-bearing mainnet.');
  }
  if (rehearsal.hostIds.length === 0) {
    throw new Error('Deployment readiness rehearsals require host ids.');
  }
  if (rehearsal.runtimeReceiptIds.length === 0) {
    throw new Error('Deployment readiness rehearsals require runtime receipt ids.');
  }
  if (rehearsal.validationCommands.length === 0) {
    throw new Error('Deployment readiness rehearsals require validation commands.');
  }
  if (rehearsal.proofRootBasis.length === 0) {
    throw new Error('Deployment readiness rehearsals require proof roots.');
  }
  if (!/blocked|denied|locked|remains blocked/iu.test(rehearsal.failClosedResult)) {
    throw new Error('Deployment readiness rehearsals require fail-closed result text.');
  }
}

function assertRehearsalId(rehearsalId: string): DeploymentReadinessRehearsalId {
  if (!DEPLOYMENT_READINESS_REHEARSAL_IDS.includes(rehearsalId as DeploymentReadinessRehearsalId)) {
    throw new Error(`Unsupported deployment readiness rehearsal id: ${rehearsalId}.`);
  }
  return rehearsalId as DeploymentReadinessRehearsalId;
}

function assertSurface(surface: string): DeploymentReadinessRehearsalSurface {
  if (!FULL_STACK_SURFACES.includes(surface as DeploymentReadinessRehearsalSurface)) {
    throw new Error(`Unsupported deployment readiness rehearsal surface: ${surface}.`);
  }
  return surface as DeploymentReadinessRehearsalSurface;
}

function assertAdmissionVerdict(verdict: string): DeploymentReadinessAdmissionVerdict {
  if (verdict !== 'admitted_non_value_rehearsal' && verdict !== 'blocked_value_bearing_mainnet') {
    throw new Error(`Unsupported deployment readiness admission verdict: ${verdict}.`);
  }
  return verdict;
}

function assertDeploymentHostCapabilityId(hostId: string): DeploymentHostCapabilityId {
  if (!DEPLOYMENT_HOST_CAPABILITY_IDS.includes(hostId as DeploymentHostCapabilityId)) {
    throw new Error(`Unsupported deployment host capability id: ${hostId}.`);
  }
  return hostId as DeploymentHostCapabilityId;
}

function assertEnvironmentLaneContractId(laneId: string): EnvironmentLaneContractId {
  if (!ENVIRONMENT_LANE_CONTRACT_IDS.includes(laneId as EnvironmentLaneContractId)) {
    throw new Error(`Unsupported environment lane contract id: ${laneId}.`);
  }
  return laneId as EnvironmentLaneContractId;
}

function assertSourceSafeString(value: string, label: string): string {
  const normalized = assertNonEmptyString(value, label).trim();
  for (const pattern of SECRET_OR_SOURCE_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`${label} must be source-safe deployment readiness rehearsal metadata.`);
    }
  }
  return normalized;
}

function stableRoot(prefix: string, parts: readonly string[]): string {
  const digest = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 24);
  return `${prefix}:${digest}`;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates].sort();
}

import { createHash } from 'crypto';
import { assertNonEmptyString } from './constants';
import type { BtdProtocolTelemetrySourceSafety } from './telemetry';

export const DEPLOYMENT_HOST_CAPABILITY_IDS = [
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

export type DeploymentHostCapabilityId = (typeof DEPLOYMENT_HOST_CAPABILITY_IDS)[number];

export const ENVIRONMENT_LANE_CONTRACT_IDS = [
  'local',
  'regtest',
  'signet',
  'staging-testnet',
  'public-testnet',
  'mainnet-ready-dry-run',
  'value-bearing-mainnet',
] as const;

export type EnvironmentLaneContractId = (typeof ENVIRONMENT_LANE_CONTRACT_IDS)[number];

export type DeploymentHostRuntimeSurface =
  | 'website'
  | 'api'
  | 'mcp_api'
  | 'chatgpt_app'
  | 'worker'
  | 'observer'
  | 'broadcaster'
  | 'proof_service'
  | 'repair_job'
  | 'object_storage'
  | 'database_projection'
  | 'ledger_projection';

export type DeploymentHostNetworkPosture =
  | 'none'
  | 'inbound_http'
  | 'outbound_restricted'
  | 'provider_bound'
  | 'egress_locked';

export type DeploymentCapabilityPosture =
  | 'required'
  | 'supported'
  | 'not_applicable';

export type DeploymentHostAdmissionStatus =
  | 'admitted_non_value_lanes'
  | 'admitted_projection_carrier'
  | 'blocked_until_lane_contract';

export interface DeploymentHostCapabilityRowInput {
  hostId: DeploymentHostCapabilityId;
  runtimeSurface: DeploymentHostRuntimeSurface;
  ownerPackage: string;
  runtimeCarrier: string;
  requiredPackages: readonly string[];
  outboundNetworkPosture: DeploymentHostNetworkPosture;
  requiredSecretFamilies: readonly string[];
  storageCarriers: readonly string[];
  observerCapability: DeploymentCapabilityPosture;
  broadcasterCapability: DeploymentCapabilityPosture;
  repairCapability: DeploymentCapabilityPosture;
  proofOutputPaths: readonly string[];
  validationCommand: string;
  supportedLaneIds: readonly EnvironmentLaneContractId[];
  admissionStatus: DeploymentHostAdmissionStatus;
  failureMode: string;
  repairPosture: string;
  telemetryProofHookId: string;
  proofRootBasis: readonly string[];
}

export interface DeploymentHostCapabilityRow extends DeploymentHostCapabilityRowInput {
  kind: 'bitcode.deployment_host_capability_catalog.row';
  requiredPackages: string[];
  requiredSecretFamilies: string[];
  storageCarriers: string[];
  proofOutputPaths: string[];
  supportedLaneIds: EnvironmentLaneContractId[];
  proofRootBasis: string[];
  rowRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface DeploymentHostCapabilityCatalogInput {
  rows?: readonly DeploymentHostCapabilityRowInput[];
  requiredHostIds?: readonly DeploymentHostCapabilityId[];
}

export interface DeploymentHostCapabilityCatalog {
  kind: 'bitcode.deployment_host_capability_catalog';
  schemaId: 'bitcode.deploymentHostCapabilityCatalog.v1';
  catalogRoot: string;
  rowCount: number;
  requiredHostIds: DeploymentHostCapabilityId[];
  observedHostIds: DeploymentHostCapabilityId[];
  missingHostIds: DeploymentHostCapabilityId[];
  rows: DeploymentHostCapabilityRow[];
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export type EnvironmentLaneBitcoinNetworkPosture =
  | 'none'
  | 'regtest'
  | 'signet'
  | 'testnet'
  | 'mainnet';

export type EnvironmentLaneProjectPosture =
  | 'local_process'
  | 'local_project'
  | 'staging_testnet_project'
  | 'public_testnet_project'
  | 'production_project_dry_run'
  | 'production_project_blocked';

export type EnvironmentLaneValueBearingAdmission =
  | 'not_value_bearing'
  | 'dry_run_only'
  | 'blocked_future_canon_required';

export type EnvironmentLaneWalletPolicy =
  | 'no_wallet'
  | 'regtest_wallet'
  | 'signet_wallet'
  | 'testnet_wallet'
  | 'mainnet_watch_only'
  | 'mainnet_value_blocked';

export interface EnvironmentLaneContractInput {
  laneId: EnvironmentLaneContractId;
  bitcoinNetworkPosture: EnvironmentLaneBitcoinNetworkPosture;
  supabaseProjectPosture: EnvironmentLaneProjectPosture;
  vercelProjectPosture: EnvironmentLaneProjectPosture;
  valueBearingAdmission: EnvironmentLaneValueBearingAdmission;
  dataRetentionPolicy: string;
  walletPolicy: EnvironmentLaneWalletPolicy;
  secretScope: string;
  proofRequirements: readonly string[];
  admittedHostIds: readonly DeploymentHostCapabilityId[];
  failureMode: string;
  repairPosture: string;
  telemetryProofHookId: string;
  proofRootBasis: readonly string[];
}

export interface EnvironmentLaneContract extends EnvironmentLaneContractInput {
  kind: 'bitcode.environment_lane_contract';
  proofRequirements: string[];
  admittedHostIds: DeploymentHostCapabilityId[];
  proofRootBasis: string[];
  laneRoot: string;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

export interface EnvironmentLaneContractsInput {
  lanes?: readonly EnvironmentLaneContractInput[];
  requiredLaneIds?: readonly EnvironmentLaneContractId[];
}

export interface EnvironmentLaneContracts {
  kind: 'bitcode.environment_lane_contracts';
  schemaId: 'bitcode.environmentLaneContracts.v1';
  laneContractRoot: string;
  laneCount: number;
  requiredLaneIds: EnvironmentLaneContractId[];
  observedLaneIds: EnvironmentLaneContractId[];
  missingLaneIds: EnvironmentLaneContractId[];
  lanes: EnvironmentLaneContract[];
  valueBearingMainnetBlocked: true;
  sourceSafety: BtdProtocolTelemetrySourceSafety;
}

const SOURCE_SAFETY: BtdProtocolTelemetrySourceSafety = {
  sourceSafe: true,
  protectedSourceVisible: false,
  containsProtectedSource: false,
  containsSecret: false,
};

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

export const DEPLOYMENT_HOST_CAPABILITY_REQUIRED_ROW_FIELDS = [
  'ownerPackage',
  'runtimeCarrier',
  'requiredPackages',
  'outboundNetworkPosture',
  'requiredSecretFamilies',
  'storageCarriers',
  'proofOutputPaths',
  'validationCommand',
  'supportedLaneIds',
  'admissionStatus',
  'failureMode',
  'repairPosture',
  'telemetryProofHookId',
] as const;

export const ENVIRONMENT_LANE_CONTRACT_REQUIRED_ROW_FIELDS = [
  'bitcoinNetworkPosture',
  'supabaseProjectPosture',
  'vercelProjectPosture',
  'valueBearingAdmission',
  'dataRetentionPolicy',
  'walletPolicy',
  'secretScope',
  'proofRequirements',
  'admittedHostIds',
  'failureMode',
  'repairPosture',
  'telemetryProofHookId',
] as const;

export function buildDeploymentHostCapabilityRows(): DeploymentHostCapabilityRowInput[] {
  return [
    {
      hostId: 'website',
      runtimeSurface: 'website',
      ownerPackage: 'uapi',
      runtimeCarrier: 'vercel-nextjs-website',
      requiredPackages: ['@bitcode/api', '@bitcode/asset-packs-pipelines-domain', '@bitcode/btd'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['vercel_project_identity', 'supabase_project_credentials', 'github_app_installation'],
      storageCarriers: ['database_projection', 'object_storage'],
      observerCapability: 'supported',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-deployment-host-capability-catalog.json'],
      validationCommand:
        'pnpm --dir uapi exec jest --runTestsByPath tests/terminalInterfaceIntegrationRegression.test.ts --runInBand',
      supportedLaneIds: ['local', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'website-host-without-lane-contract-or-disclosure-lock',
      repairPosture: 'deny-read-unlock-and-run-deployment-host-capability-check',
      telemetryProofHookId: 'deployment.telemetry.website',
      proofRootBasis: ['Terminal interface contracts', 'DeploymentHostCapabilityCatalog'],
    },
    {
      hostId: 'api',
      runtimeSurface: 'api',
      ownerPackage: 'packages/api',
      runtimeCarrier: 'vercel-node-api',
      requiredPackages: ['@bitcode/api', '@bitcode/btd'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['supabase_project_credentials', 'github_app_installation'],
      storageCarriers: ['database_projection', 'ledger_projection'],
      observerCapability: 'supported',
      broadcasterCapability: 'supported',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-environment-lane-contracts.json'],
      validationCommand:
        'pnpm --filter @bitcode/api exec jest --config jest.config.cjs --runTestsByPath src/routes/__tests__/btd-crypto.test.ts --runInBand',
      supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'api-host-without-source-safe-contracts-or-lane-policy',
      repairPosture: 'deny-route-admission-and-run-api-contract-checks',
      telemetryProofHookId: 'deployment.telemetry.api',
      proofRootBasis: ['Public API contract catalog', 'EnvironmentLaneContract'],
    },
    {
      hostId: 'mcp_api',
      runtimeSurface: 'mcp_api',
      ownerPackage: 'packages/generic-mcps/bitcode',
      runtimeCarrier: 'mcp-server-process',
      requiredPackages: ['@bitcode/btd', '@bitcode/asset-packs-pipelines-domain'],
      outboundNetworkPosture: 'outbound_restricted',
      requiredSecretFamilies: ['mcp_session_authority', 'supabase_project_credentials'],
      storageCarriers: ['database_projection', 'proof_artifacts'],
      observerCapability: 'supported',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v33-mcp-api-tool-contracts.json'],
      validationCommand:
        'pnpm --dir packages/generic-mcps/bitcode run test:mcp -- --runTestsByPath src/__tests__/unit/pipeline-ingress-contract.test.ts --runInBand',
      supportedLaneIds: ['local', 'staging-testnet', 'public-testnet'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'mcp-api-host-without-tool-contract-or-permission-proof',
      repairPosture: 'deny-tool-write-and-refresh-mcp-contract-proof',
      telemetryProofHookId: 'deployment.telemetry.mcp-api',
      proofRootBasis: ['MCP API tool contracts', 'DeploymentHostCapabilityCatalog'],
    },
    {
      hostId: 'chatgpt_app',
      runtimeSurface: 'chatgpt_app',
      ownerPackage: 'packages/chatgptapp',
      runtimeCarrier: 'chatgpt-action-service',
      requiredPackages: ['@bitcode/btd'],
      outboundNetworkPosture: 'outbound_restricted',
      requiredSecretFamilies: ['chatgpt_action_authority', 'supabase_project_credentials'],
      storageCarriers: ['database_projection'],
      observerCapability: 'supported',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v33-chatgpt-app-action-contracts.json'],
      validationCommand:
        'pnpm --dir packages/chatgptapp exec jest --runTestsByPath src/__tests__/tools.test.ts --runInBand',
      supportedLaneIds: ['local', 'staging-testnet', 'public-testnet'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'chatgpt-app-host-without-confirmed-action-contract',
      repairPosture: 'deny-action-write-and-refresh-chatgpt-contract-proof',
      telemetryProofHookId: 'deployment.telemetry.chatgpt-app',
      proofRootBasis: ['ChatGPT App action contracts', 'EnvironmentLaneContract'],
    },
    {
      hostId: 'pipeline_workers',
      runtimeSurface: 'worker',
      ownerPackage: 'packages/pipeline-hosts',
      runtimeCarrier: 'vercel-sandbox-worker',
      requiredPackages: ['@bitcode/pipeline-hosts', '@bitcode/asset-packs-pipelines-domain'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['vercel_project_identity', 'openai_inference_access', 'supabase_project_credentials'],
      storageCarriers: ['object_storage', 'database_projection', 'proof_artifacts'],
      observerCapability: 'supported',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-distributed-execution-runtime-receipts.json'],
      validationCommand: 'pnpm --filter @bitcode/pipeline-hosts typecheck',
      supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'pipeline-worker-without-runtime-receipt-or-storage-root',
      repairPosture: 'retry-through-distributed-execution-runtime-receipt',
      telemetryProofHookId: 'deployment.telemetry.pipeline-worker',
      proofRootBasis: ['ReadFitsFindingSynthesis', 'DistributedExecutionRuntimeReceipt'],
    },
    {
      hostId: 'runtime_observers',
      runtimeSurface: 'observer',
      ownerPackage: 'packages/btd',
      runtimeCarrier: 'scheduled-observer-job',
      requiredPackages: ['@bitcode/btd'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['ledger_read_access', 'supabase_project_credentials'],
      storageCarriers: ['ledger_projection', 'database_projection', 'proof_artifacts'],
      observerCapability: 'required',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json'],
      validationCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/v32-testnet-mainnet-readiness-rehearsal.test.ts',
      supportedLaneIds: ['regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'observer-host-lag-without-repairable-proof-root',
      repairPosture: 'block-unlock-and-run-observer-repair-job',
      telemetryProofHookId: 'deployment.telemetry.runtime-observer',
      proofRootBasis: ['settlement observer receipts', 'ledger projection roots'],
    },
    {
      hostId: 'ledger_broadcasters',
      runtimeSurface: 'broadcaster',
      ownerPackage: 'packages/btd',
      runtimeCarrier: 'ledger-broadcaster-job',
      requiredPackages: ['@bitcode/btd'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['wallet_signing_authority', 'ledger_broadcast_access'],
      storageCarriers: ['ledger_projection', 'proof_artifacts'],
      observerCapability: 'supported',
      broadcasterCapability: 'required',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-runtime-observers-broadcasters-repair-jobs.json'],
      validationCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/btc-fee-operation.test.ts',
      supportedLaneIds: ['regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'ledger-broadcaster-without-lane-wallet-policy',
      repairPosture: 'deny-broadcast-and-refresh-lane-wallet-policy',
      telemetryProofHookId: 'deployment.telemetry.ledger-broadcaster',
      proofRootBasis: ['BtcFeeOperation', 'BtdRightsTransferReceipt'],
    },
    {
      hostId: 'proof_services',
      runtimeSurface: 'proof_service',
      ownerPackage: 'packages/specifying',
      runtimeCarrier: 'proof-generation-job',
      requiredPackages: ['@bitcode/specifying', '@bitcode/btd'],
      outboundNetworkPosture: 'none',
      requiredSecretFamilies: [],
      storageCarriers: ['proof_artifacts', 'object_storage'],
      observerCapability: 'not_applicable',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-promotion-readiness-report.json'],
      validationCommand: 'pnpm --filter @bitcode/specifying test',
      supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'proof-service-without-deterministic-artifact-inputs',
      repairPosture: 'regenerate-artifacts-and-replay-proof-checks',
      telemetryProofHookId: 'deployment.telemetry.proof-service',
      proofRootBasis: ['canonical input report', 'spec family report'],
    },
    {
      hostId: 'repair_jobs',
      runtimeSurface: 'repair_job',
      ownerPackage: 'packages/btd',
      runtimeCarrier: 'operator-repair-command',
      requiredPackages: ['@bitcode/btd', '@bitcode/specifying'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['operator_repair_authority', 'supabase_project_credentials'],
      storageCarriers: ['database_projection', 'ledger_projection', 'object_storage', 'proof_artifacts'],
      observerCapability: 'supported',
      broadcasterCapability: 'supported',
      repairCapability: 'required',
      proofOutputPaths: ['.bitcode/v34-rollback-upgrade-data-repair-playbooks.json'],
      validationCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_non_value_lanes',
      failureMode: 'repair-job-without-operator-approval-or-proof-root',
      repairPosture: 'require-approval-and-emit-repair-playbook-receipt',
      telemetryProofHookId: 'deployment.telemetry.repair-job',
      proofRootBasis: ['RollbackUpgradeRepairPlaybook', 'RuntimeObserverRepairJob'],
    },
    {
      hostId: 'object_storage',
      runtimeSurface: 'object_storage',
      ownerPackage: 'packages/pipeline-hosts',
      runtimeCarrier: 'durable-object-storage',
      requiredPackages: ['@bitcode/pipeline-hosts'],
      outboundNetworkPosture: 'egress_locked',
      requiredSecretFamilies: ['object_storage_write_access'],
      storageCarriers: ['object_storage', 'proof_artifacts'],
      observerCapability: 'supported',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-deployment-storage-posture.json'],
      validationCommand: 'pnpm --filter @bitcode/pipeline-hosts typecheck',
      supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_projection_carrier',
      failureMode: 'object-storage-carrier-without-retention-or-disclosure-policy',
      repairPosture: 'lock-delivery-and-run-storage-posture-repair',
      telemetryProofHookId: 'deployment.telemetry.object-storage',
      proofRootBasis: ['AssetPackPreview', 'DeploymentStoragePosture'],
    },
    {
      hostId: 'database_projection',
      runtimeSurface: 'database_projection',
      ownerPackage: 'packages/supabase',
      runtimeCarrier: 'supabase-postgres-projection',
      requiredPackages: ['@bitcode/supabase', '@bitcode/btd'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['supabase_project_credentials'],
      storageCarriers: ['database_projection'],
      observerCapability: 'supported',
      broadcasterCapability: 'not_applicable',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-deployment-storage-posture.json'],
      validationCommand: 'pnpm --filter @bitcode/btd typecheck',
      supportedLaneIds: ['local', 'regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_projection_carrier',
      failureMode: 'database-projection-drift-without-repair-command',
      repairPosture: 'block-derived-read-state-and-run-projection-repair',
      telemetryProofHookId: 'deployment.telemetry.database-projection',
      proofRootBasis: ['ledger database reconciliation', 'DeploymentStoragePosture'],
    },
    {
      hostId: 'ledger_projection',
      runtimeSurface: 'ledger_projection',
      ownerPackage: 'packages/btd',
      runtimeCarrier: 'ledger-projection-store',
      requiredPackages: ['@bitcode/btd'],
      outboundNetworkPosture: 'provider_bound',
      requiredSecretFamilies: ['ledger_read_access'],
      storageCarriers: ['ledger_projection', 'proof_artifacts'],
      observerCapability: 'required',
      broadcasterCapability: 'supported',
      repairCapability: 'supported',
      proofOutputPaths: ['.bitcode/v34-deployment-storage-posture.json'],
      validationCommand:
        'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/reconciliation.test.ts',
      supportedLaneIds: ['regtest', 'signet', 'staging-testnet', 'public-testnet', 'mainnet-ready-dry-run'],
      admissionStatus: 'admitted_projection_carrier',
      failureMode: 'ledger-projection-drift-without-finality-repair',
      repairPosture: 'hold-rights-unlock-and-run-ledger-projection-repair',
      telemetryProofHookId: 'deployment.telemetry.ledger-projection',
      proofRootBasis: ['ledger finality state', 'BtdRightsTransferReceipt'],
    },
  ];
}

export function buildEnvironmentLaneContractRows(): EnvironmentLaneContractInput[] {
  const allNonValueHosts = DEPLOYMENT_HOST_CAPABILITY_IDS.filter(
    (hostId) => hostId !== 'ledger_broadcasters',
  );

  return [
    {
      laneId: 'local',
      bitcoinNetworkPosture: 'none',
      supabaseProjectPosture: 'local_process',
      vercelProjectPosture: 'local_process',
      valueBearingAdmission: 'not_value_bearing',
      dataRetentionPolicy: 'ephemeral-local-development',
      walletPolicy: 'no_wallet',
      secretScope: 'developer-local-env-file',
      proofRequirements: ['spec-family-check', 'gate-check'],
      admittedHostIds: ['website', 'api', 'mcp_api', 'chatgpt_app', 'pipeline_workers', 'proof_services', 'repair_jobs', 'object_storage', 'database_projection'],
      failureMode: 'local-lane-without-deterministic-checks',
      repairPosture: 'rerun-local-gate-checks-before-pr',
      telemetryProofHookId: 'deployment.telemetry.lane.local',
      proofRootBasis: ['local checks', 'source-safe fixtures'],
    },
    {
      laneId: 'regtest',
      bitcoinNetworkPosture: 'regtest',
      supabaseProjectPosture: 'local_project',
      vercelProjectPosture: 'local_project',
      valueBearingAdmission: 'not_value_bearing',
      dataRetentionPolicy: 'ephemeral-regtest-development',
      walletPolicy: 'regtest_wallet',
      secretScope: 'local-regtest-only',
      proofRequirements: ['regtest-wallet-proof', 'ledger-projection-proof'],
      admittedHostIds: ['api', 'pipeline_workers', 'runtime_observers', 'ledger_broadcasters', 'proof_services', 'repair_jobs', 'object_storage', 'database_projection', 'ledger_projection'],
      failureMode: 'regtest-lane-without-wallet-or-ledger-proof',
      repairPosture: 'reset-regtest-ledger-and-replay-settlement-fixture',
      telemetryProofHookId: 'deployment.telemetry.lane.regtest',
      proofRootBasis: ['regtest settlement fixture', 'ledger projection repair'],
    },
    {
      laneId: 'signet',
      bitcoinNetworkPosture: 'signet',
      supabaseProjectPosture: 'staging_testnet_project',
      vercelProjectPosture: 'staging_testnet_project',
      valueBearingAdmission: 'not_value_bearing',
      dataRetentionPolicy: 'bounded-testnet-retention',
      walletPolicy: 'signet_wallet',
      secretScope: 'staging-testnet-secret-set',
      proofRequirements: ['signet-finality-proof', 'source-safe-runtime-receipts'],
      admittedHostIds: ['api', 'pipeline_workers', 'runtime_observers', 'ledger_broadcasters', 'proof_services', 'repair_jobs', 'object_storage', 'database_projection', 'ledger_projection'],
      failureMode: 'signet-lane-without-finality-or-repair-proof',
      repairPosture: 'pause-settlement-unlock-and-run-finality-repair',
      telemetryProofHookId: 'deployment.telemetry.lane.signet',
      proofRootBasis: ['signet finality state', 'runtime observer receipt'],
    },
    {
      laneId: 'staging-testnet',
      bitcoinNetworkPosture: 'signet',
      supabaseProjectPosture: 'staging_testnet_project',
      vercelProjectPosture: 'staging_testnet_project',
      valueBearingAdmission: 'not_value_bearing',
      dataRetentionPolicy: 'bounded-staging-testnet-retention',
      walletPolicy: 'signet_wallet',
      secretScope: 'staging-testnet-secret-set',
      proofRequirements: ['terminal-rehearsal-proof', 'pipeline-runtime-receipts', 'source-safe-log-proof'],
      admittedHostIds: [...DEPLOYMENT_HOST_CAPABILITY_IDS],
      failureMode: 'staging-testnet-lane-without-complete-rehearsal-proof',
      repairPosture: 'block-promotion-and-repeat-staging-testnet-rehearsal',
      telemetryProofHookId: 'deployment.telemetry.lane.staging-testnet',
      proofRootBasis: ['DeploymentReadinessRehearsal', 'Terminal transaction proof'],
    },
    {
      laneId: 'public-testnet',
      bitcoinNetworkPosture: 'testnet',
      supabaseProjectPosture: 'public_testnet_project',
      vercelProjectPosture: 'public_testnet_project',
      valueBearingAdmission: 'not_value_bearing',
      dataRetentionPolicy: 'bounded-public-testnet-retention',
      walletPolicy: 'testnet_wallet',
      secretScope: 'public-testnet-secret-set',
      proofRequirements: ['public-testnet-finality-proof', 'operator-approval-proof'],
      admittedHostIds: [...DEPLOYMENT_HOST_CAPABILITY_IDS],
      failureMode: 'public-testnet-lane-without-operator-approval',
      repairPosture: 'remove-public-testnet-admission-and-replay-approval-gate',
      telemetryProofHookId: 'deployment.telemetry.lane.public-testnet',
      proofRootBasis: ['MigrationApprovalGate', 'DeploymentReadinessRehearsal'],
    },
    {
      laneId: 'mainnet-ready-dry-run',
      bitcoinNetworkPosture: 'mainnet',
      supabaseProjectPosture: 'production_project_dry_run',
      vercelProjectPosture: 'production_project_dry_run',
      valueBearingAdmission: 'dry_run_only',
      dataRetentionPolicy: 'production-shaped-dry-run-retention',
      walletPolicy: 'mainnet_watch_only',
      secretScope: 'mainnet-dry-run-secret-set',
      proofRequirements: ['mainnet-watch-only-proof', 'dry-run-settlement-proof', 'operator-approval-proof'],
      admittedHostIds: allNonValueHosts,
      failureMode: 'mainnet-ready-dry-run-attempts-value-bearing-broadcast',
      repairPosture: 'deny-broadcast-and-demote-to-public-testnet-lane',
      telemetryProofHookId: 'deployment.telemetry.lane.mainnet-ready-dry-run',
      proofRootBasis: ['mainnet watch-only receipt', 'deployment approval gate'],
    },
    {
      laneId: 'value-bearing-mainnet',
      bitcoinNetworkPosture: 'mainnet',
      supabaseProjectPosture: 'production_project_blocked',
      vercelProjectPosture: 'production_project_blocked',
      valueBearingAdmission: 'blocked_future_canon_required',
      dataRetentionPolicy: 'blocked-until-future-canon',
      walletPolicy: 'mainnet_value_blocked',
      secretScope: 'blocked-no-runtime-secret-scope',
      proofRequirements: ['future-canon-authorization', 'operator-approval-proof', 'mainnet-broadcast-proof'],
      admittedHostIds: [],
      failureMode: 'value-bearing-mainnet-requested-before-canonical-admission',
      repairPosture: 'fail-closed-and-run-mainnet-blocker-report',
      telemetryProofHookId: 'deployment.telemetry.lane.value-bearing-mainnet',
      proofRootBasis: ['future canon blocker', 'value-bearing mainnet blocked'],
    },
  ];
}

export function buildDeploymentHostCapabilityRow(
  input: DeploymentHostCapabilityRowInput,
): DeploymentHostCapabilityRow {
  const hostId = assertDeploymentHostCapabilityId(input.hostId);
  const supportedLaneIds = assertEnvironmentLaneIds(input.supportedLaneIds);
  const row = {
    kind: 'bitcode.deployment_host_capability_catalog.row' as const,
    hostId,
    runtimeSurface: assertRuntimeSurface(input.runtimeSurface),
    ownerPackage: assertSourceSafeString(input.ownerPackage, 'ownerPackage'),
    runtimeCarrier: assertSourceSafeString(input.runtimeCarrier, 'runtimeCarrier'),
    requiredPackages: assertSourceSafeStrings(input.requiredPackages, 'requiredPackages'),
    outboundNetworkPosture: assertNetworkPosture(input.outboundNetworkPosture),
    requiredSecretFamilies: assertSourceSafeStrings(input.requiredSecretFamilies, 'requiredSecretFamilies'),
    storageCarriers: assertSourceSafeStrings(input.storageCarriers, 'storageCarriers'),
    observerCapability: assertCapabilityPosture(input.observerCapability),
    broadcasterCapability: assertCapabilityPosture(input.broadcasterCapability),
    repairCapability: assertCapabilityPosture(input.repairCapability),
    proofOutputPaths: assertSourceSafeStrings(input.proofOutputPaths, 'proofOutputPaths'),
    validationCommand: assertSourceSafeString(input.validationCommand, 'validationCommand'),
    supportedLaneIds,
    admissionStatus: assertHostAdmissionStatus(input.admissionStatus),
    failureMode: assertSourceSafeString(input.failureMode, 'failureMode'),
    repairPosture: assertSourceSafeString(input.repairPosture, 'repairPosture'),
    telemetryProofHookId: assertSourceSafeString(input.telemetryProofHookId, 'telemetryProofHookId'),
    proofRootBasis: assertSourceSafeStrings(input.proofRootBasis, 'proofRootBasis').sort(),
    sourceSafety: { ...SOURCE_SAFETY },
  };

  if (row.admissionStatus === 'blocked_until_lane_contract' && row.supportedLaneIds.length > 0) {
    throw new Error(`${hostId} cannot support lanes while blocked until lane contract.`);
  }
  if (row.hostId === 'ledger_broadcasters' && row.broadcasterCapability !== 'required') {
    throw new Error('ledger_broadcasters must require broadcaster capability.');
  }
  if (row.hostId === 'runtime_observers' && row.observerCapability !== 'required') {
    throw new Error('runtime_observers must require observer capability.');
  }
  if (row.hostId === 'repair_jobs' && row.repairCapability !== 'required') {
    throw new Error('repair_jobs must require repair capability.');
  }

  return {
    ...row,
    rowRoot: stableRoot('deployment-host-capability-row', [
      row.hostId,
      row.runtimeSurface,
      row.ownerPackage,
      row.runtimeCarrier,
      row.requiredPackages.join(','),
      row.outboundNetworkPosture,
      row.requiredSecretFamilies.join(','),
      row.storageCarriers.join(','),
      row.observerCapability,
      row.broadcasterCapability,
      row.repairCapability,
      row.proofOutputPaths.join(','),
      row.validationCommand,
      row.supportedLaneIds.join(','),
      row.admissionStatus,
      row.failureMode,
      row.repairPosture,
      row.telemetryProofHookId,
      row.proofRootBasis.join(','),
    ]),
  };
}

export function buildDeploymentHostCapabilityCatalog(
  input: DeploymentHostCapabilityCatalogInput = {},
): DeploymentHostCapabilityCatalog {
  const rows = (input.rows ?? buildDeploymentHostCapabilityRows()).map(
    buildDeploymentHostCapabilityRow,
  );
  const requiredHostIds = [...(input.requiredHostIds ?? DEPLOYMENT_HOST_CAPABILITY_IDS)];
  const observedHostIds = Array.from(new Set(rows.map((row) => row.hostId))).sort();
  const missingHostIds = requiredHostIds.filter((hostId) => !observedHostIds.includes(hostId));
  const duplicateHostIds = findDuplicates(rows.map((row) => row.hostId));

  if (missingHostIds.length) {
    throw new Error(`Deployment host capability catalog missing host ids: ${missingHostIds.join(', ')}.`);
  }
  if (duplicateHostIds.length) {
    throw new Error(`Deployment host capability catalog contains duplicate host ids: ${duplicateHostIds.join(', ')}.`);
  }

  return {
    kind: 'bitcode.deployment_host_capability_catalog',
    schemaId: 'bitcode.deploymentHostCapabilityCatalog.v1',
    catalogRoot: stableRoot('deployment-host-capability-catalog', [
      ...rows.map((row) => row.rowRoot),
      requiredHostIds.join(','),
    ]),
    rowCount: rows.length,
    requiredHostIds,
    observedHostIds,
    missingHostIds,
    rows,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

export function buildEnvironmentLaneContract(
  input: EnvironmentLaneContractInput,
): EnvironmentLaneContract {
  const laneId = assertEnvironmentLaneContractId(input.laneId);
  const admittedHostIds = assertDeploymentHostCapabilityIds(input.admittedHostIds);
  const row = {
    kind: 'bitcode.environment_lane_contract' as const,
    laneId,
    bitcoinNetworkPosture: assertBitcoinNetworkPosture(input.bitcoinNetworkPosture),
    supabaseProjectPosture: assertProjectPosture(input.supabaseProjectPosture),
    vercelProjectPosture: assertProjectPosture(input.vercelProjectPosture),
    valueBearingAdmission: assertValueBearingAdmission(input.valueBearingAdmission),
    dataRetentionPolicy: assertSourceSafeString(input.dataRetentionPolicy, 'dataRetentionPolicy'),
    walletPolicy: assertWalletPolicy(input.walletPolicy),
    secretScope: assertSourceSafeString(input.secretScope, 'secretScope'),
    proofRequirements: assertSourceSafeStrings(input.proofRequirements, 'proofRequirements'),
    admittedHostIds,
    failureMode: assertSourceSafeString(input.failureMode, 'failureMode'),
    repairPosture: assertSourceSafeString(input.repairPosture, 'repairPosture'),
    telemetryProofHookId: assertSourceSafeString(input.telemetryProofHookId, 'telemetryProofHookId'),
    proofRootBasis: assertSourceSafeStrings(input.proofRootBasis, 'proofRootBasis').sort(),
    sourceSafety: { ...SOURCE_SAFETY },
  };

  if (row.laneId === 'value-bearing-mainnet') {
    if (row.valueBearingAdmission !== 'blocked_future_canon_required') {
      throw new Error('value-bearing-mainnet must remain blocked until future canon admits it.');
    }
    if (row.admittedHostIds.length !== 0) {
      throw new Error('value-bearing-mainnet must not admit runtime hosts.');
    }
    if (row.walletPolicy !== 'mainnet_value_blocked') {
      throw new Error('value-bearing-mainnet must use the blocked mainnet wallet policy.');
    }
  }
  if (row.laneId === 'mainnet-ready-dry-run' && row.valueBearingAdmission !== 'dry_run_only') {
    throw new Error('mainnet-ready-dry-run must be dry-run only.');
  }

  return {
    ...row,
    laneRoot: stableRoot('environment-lane-contract', [
      row.laneId,
      row.bitcoinNetworkPosture,
      row.supabaseProjectPosture,
      row.vercelProjectPosture,
      row.valueBearingAdmission,
      row.dataRetentionPolicy,
      row.walletPolicy,
      row.secretScope,
      row.proofRequirements.join(','),
      row.admittedHostIds.join(','),
      row.failureMode,
      row.repairPosture,
      row.telemetryProofHookId,
      row.proofRootBasis.join(','),
    ]),
  };
}

export function buildEnvironmentLaneContracts(
  input: EnvironmentLaneContractsInput = {},
): EnvironmentLaneContracts {
  const lanes = (input.lanes ?? buildEnvironmentLaneContractRows()).map(
    buildEnvironmentLaneContract,
  );
  const requiredLaneIds = [...(input.requiredLaneIds ?? ENVIRONMENT_LANE_CONTRACT_IDS)];
  const observedLaneIds = Array.from(new Set(lanes.map((lane) => lane.laneId))).sort();
  const missingLaneIds = requiredLaneIds.filter((laneId) => !observedLaneIds.includes(laneId));
  const duplicateLaneIds = findDuplicates(lanes.map((lane) => lane.laneId));
  const valueBearingMainnet = lanes.find((lane) => lane.laneId === 'value-bearing-mainnet');

  if (missingLaneIds.length) {
    throw new Error(`Environment lane contracts missing lane ids: ${missingLaneIds.join(', ')}.`);
  }
  if (duplicateLaneIds.length) {
    throw new Error(`Environment lane contracts contain duplicate lane ids: ${duplicateLaneIds.join(', ')}.`);
  }
  if (valueBearingMainnet?.valueBearingAdmission !== 'blocked_future_canon_required') {
    throw new Error('Environment lane contracts must keep value-bearing-mainnet blocked.');
  }

  return {
    kind: 'bitcode.environment_lane_contracts',
    schemaId: 'bitcode.environmentLaneContracts.v1',
    laneContractRoot: stableRoot('environment-lane-contracts', [
      ...lanes.map((lane) => lane.laneRoot),
      requiredLaneIds.join(','),
    ]),
    laneCount: lanes.length,
    requiredLaneIds,
    observedLaneIds,
    missingLaneIds,
    lanes,
    valueBearingMainnetBlocked: true,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

function assertDeploymentHostCapabilityId(hostId: string): DeploymentHostCapabilityId {
  if (!DEPLOYMENT_HOST_CAPABILITY_IDS.includes(hostId as DeploymentHostCapabilityId)) {
    throw new Error(`Unsupported deployment host capability id: ${hostId}.`);
  }

  return hostId as DeploymentHostCapabilityId;
}

function assertDeploymentHostCapabilityIds(
  hostIds: readonly DeploymentHostCapabilityId[],
): DeploymentHostCapabilityId[] {
  return Array.from(new Set(hostIds.map(assertDeploymentHostCapabilityId))).sort();
}

function assertEnvironmentLaneContractId(laneId: string): EnvironmentLaneContractId {
  if (!ENVIRONMENT_LANE_CONTRACT_IDS.includes(laneId as EnvironmentLaneContractId)) {
    throw new Error(`Unsupported environment lane contract id: ${laneId}.`);
  }

  return laneId as EnvironmentLaneContractId;
}

function assertEnvironmentLaneIds(
  laneIds: readonly EnvironmentLaneContractId[],
): EnvironmentLaneContractId[] {
  return Array.from(new Set(laneIds.map(assertEnvironmentLaneContractId))).sort();
}

function assertRuntimeSurface(surface: string): DeploymentHostRuntimeSurface {
  const allowed: readonly DeploymentHostRuntimeSurface[] = [
    'website',
    'api',
    'mcp_api',
    'chatgpt_app',
    'worker',
    'observer',
    'broadcaster',
    'proof_service',
    'repair_job',
    'object_storage',
    'database_projection',
    'ledger_projection',
  ];
  if (!allowed.includes(surface as DeploymentHostRuntimeSurface)) {
    throw new Error(`Unsupported deployment host runtime surface: ${surface}.`);
  }

  return surface as DeploymentHostRuntimeSurface;
}

function assertNetworkPosture(posture: string): DeploymentHostNetworkPosture {
  const allowed: readonly DeploymentHostNetworkPosture[] = [
    'none',
    'inbound_http',
    'outbound_restricted',
    'provider_bound',
    'egress_locked',
  ];
  if (!allowed.includes(posture as DeploymentHostNetworkPosture)) {
    throw new Error(`Unsupported deployment host network posture: ${posture}.`);
  }

  return posture as DeploymentHostNetworkPosture;
}

function assertCapabilityPosture(posture: string): DeploymentCapabilityPosture {
  const allowed: readonly DeploymentCapabilityPosture[] = [
    'required',
    'supported',
    'not_applicable',
  ];
  if (!allowed.includes(posture as DeploymentCapabilityPosture)) {
    throw new Error(`Unsupported deployment capability posture: ${posture}.`);
  }

  return posture as DeploymentCapabilityPosture;
}

function assertHostAdmissionStatus(status: string): DeploymentHostAdmissionStatus {
  const allowed: readonly DeploymentHostAdmissionStatus[] = [
    'admitted_non_value_lanes',
    'admitted_projection_carrier',
    'blocked_until_lane_contract',
  ];
  if (!allowed.includes(status as DeploymentHostAdmissionStatus)) {
    throw new Error(`Unsupported deployment host admission status: ${status}.`);
  }

  return status as DeploymentHostAdmissionStatus;
}

function assertBitcoinNetworkPosture(posture: string): EnvironmentLaneBitcoinNetworkPosture {
  const allowed: readonly EnvironmentLaneBitcoinNetworkPosture[] = [
    'none',
    'regtest',
    'signet',
    'testnet',
    'mainnet',
  ];
  if (!allowed.includes(posture as EnvironmentLaneBitcoinNetworkPosture)) {
    throw new Error(`Unsupported environment lane Bitcoin network posture: ${posture}.`);
  }

  return posture as EnvironmentLaneBitcoinNetworkPosture;
}

function assertProjectPosture(posture: string): EnvironmentLaneProjectPosture {
  const allowed: readonly EnvironmentLaneProjectPosture[] = [
    'local_process',
    'local_project',
    'staging_testnet_project',
    'public_testnet_project',
    'production_project_dry_run',
    'production_project_blocked',
  ];
  if (!allowed.includes(posture as EnvironmentLaneProjectPosture)) {
    throw new Error(`Unsupported environment lane project posture: ${posture}.`);
  }

  return posture as EnvironmentLaneProjectPosture;
}

function assertValueBearingAdmission(
  admission: string,
): EnvironmentLaneValueBearingAdmission {
  const allowed: readonly EnvironmentLaneValueBearingAdmission[] = [
    'not_value_bearing',
    'dry_run_only',
    'blocked_future_canon_required',
  ];
  if (!allowed.includes(admission as EnvironmentLaneValueBearingAdmission)) {
    throw new Error(`Unsupported environment lane value-bearing admission: ${admission}.`);
  }

  return admission as EnvironmentLaneValueBearingAdmission;
}

function assertWalletPolicy(policy: string): EnvironmentLaneWalletPolicy {
  const allowed: readonly EnvironmentLaneWalletPolicy[] = [
    'no_wallet',
    'regtest_wallet',
    'signet_wallet',
    'testnet_wallet',
    'mainnet_watch_only',
    'mainnet_value_blocked',
  ];
  if (!allowed.includes(policy as EnvironmentLaneWalletPolicy)) {
    throw new Error(`Unsupported environment lane wallet policy: ${policy}.`);
  }

  return policy as EnvironmentLaneWalletPolicy;
}

function assertSourceSafeStrings(values: readonly string[], label: string): string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${label} must be an array.`);
  }

  return Array.from(new Set(values.map((value) => assertSourceSafeString(value, label)))).sort();
}

function assertSourceSafeString(value: unknown, label: string): string {
  const text = assertNonEmptyString(value, label);
  if (SECRET_OR_SOURCE_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`${label} must not contain secrets or non-disclosable source.`);
  }

  return text;
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
